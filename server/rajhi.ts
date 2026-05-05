import crypto from "crypto";

/**
 * Al Rajhi / Neoleap — iPayPipe integration (CORRECT API-based flow)
 *
 * Flow confirmed by Neoleap support (Rahul Dalvi):
 *   1. Build JSON plaintext:
 *      [{"id":"tranportalId","password":"...","action":"1","currencyCode":"682",
 *        "errorURL":"...","responseURL":"...","trackId":"orderId","amt":"100.00"}]
 *   2. Encrypt with AES-256-CBC, key=resourceKey (32 bytes UTF-8), IV="PGKEYENCDECIVSPC",
 *      output = HEX (uppercase)
 *   3. Server POSTs JSON to gateway API:
 *      [{"id":"tranportalId","trandata":"HEX...","errorURL":"...","responseURL":"..."}]
 *   4. Gateway returns JSON:
 *      [{"result":"PaymentID:https://...paymentpage.htm","status":"1"}]
 *   5. Browser redirects to:
 *      https://digitalpayments.alrajhibank.com.sa/pg/paymentpage.htm?PaymentID=XXX
 *   6. After payment, gateway POSTs encrypted trandata to our responseURL
 *   7. Decrypt callback trandata to get result=CAPTURED etc.
 *
 * Key details:
 *   - Algorithm : AES-256-CBC
 *   - Key       : resourceKey as UTF-8 string, 32 bytes (full key)
 *   - IV        : "PGKEYENCDECIVSPC" (fixed 16-byte string)
 *   - Output    : HEX string (uppercase)
 *   - Amount    : SAR with 2 decimal places ("100.00"), NOT halalas
 *   - Plaintext : JSON array, field names camelCase (currencyCode, trackId, etc.)
 */

const GATEWAY_API_URL = "https://digitalpayments.alrajhibank.com.sa/pg/payment/hosted.htm";
const GATEWAY_PAGE_URL = "https://digitalpayments.alrajhibank.com.sa/pg/paymentpage.htm";
const AES_IV = "PGKEYENCDECIVSPC";

// ─── AES helpers ─────────────────────────────────────────────────────────────

function aes256Encrypt(plaintext: string, resourceKey: string): string {
  const key = Buffer.from(resourceKey, "utf8").subarray(0, 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, Buffer.from(AES_IV, "utf8"));
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(plaintext, "utf8")),
    cipher.final(),
  ]);
  return encrypted.toString("hex").toUpperCase();
}

function aes256Decrypt(hexData: string, resourceKey: string): string {
  const key = Buffer.from(resourceKey, "utf8").subarray(0, 32);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(AES_IV, "utf8"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hexData.trim(), "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/** Try AES-192 decrypt as fallback (for older callbacks) */
function aes192Decrypt(hexData: string, resourceKey: string): string {
  const key = Buffer.from(resourceKey, "utf8").subarray(0, 24);
  const decipher = crypto.createDecipheriv("aes-192-cbc", key, Buffer.from(AES_IV, "utf8"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hexData.trim(), "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/** Debug: encrypt with any variant — used only by admin debug endpoint */
export type RajhiEncAlgo = "aes-192-cbc" | "aes-256-cbc" | "aes-128-cbc";

export function aesEncryptVariant(plaintext: string, key: string, algo: RajhiEncAlgo = "aes-256-cbc"): string {
  let keyBuf: Buffer;
  if (algo === "aes-256-cbc") keyBuf = Buffer.from(key, "utf8").subarray(0, 32);
  else if (algo === "aes-128-cbc") keyBuf = Buffer.from(key, "hex").subarray(0, 16);
  else keyBuf = Buffer.from(key, "utf8").subarray(0, 24);
  const cipher = crypto.createCipheriv(algo, keyBuf, Buffer.from(AES_IV, "utf8"));
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(plaintext, "utf8")),
    cipher.final(),
  ]);
  return encrypted.toString("hex").toUpperCase();
}

// ─── Query-string helpers (used for callback parsing) ────────────────────────

/**
 * Safe URL query-string parser — never throws.
 * Handles both `+` and `%XX` encoding.
 */
function parseQS(qs: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const pair of qs.split("&")) {
    const eq = pair.indexOf("=");
    if (eq < 0) continue;
    const rawKey = pair.slice(0, eq).trim().replace(/\+/g, " ");
    const rawVal = pair.slice(eq + 1).trim().replace(/\+/g, " ");
    try {
      result[decodeURIComponent(rawKey)] = decodeURIComponent(rawVal);
    } catch {
      // fall back to raw value if decoding fails
      result[rawKey] = rawVal;
    }
  }
  return result;
}

/**
 * Normalize a field map from the decrypted callback to a canonical shape.
 * Al Rajhi field names vary: "result"/"Result"/"RESULT", "trackid"/"TrackID", etc.
 */
function normalizeFields(raw: Record<string, string>): {
  result: string;
  trackId: string;
  paymentId: string;
  responseCode: string;
  auth: string;
  ref: string;
} {
  // Build a lowercase lookup
  const lc: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    lc[k.toLowerCase()] = v;
  }

  return {
    // Al Rajhi may use "result" (plain callback) or "authRespCode" (approval code "000")
    result:       lc["result"]       ?? lc["response"]      ?? lc["authrespcode"] ?? "",
    trackId:      lc["trackid"]      ?? lc["track_id"]      ?? lc["orderid"] ?? lc["order_id"] ?? "",
    paymentId:    lc["paymentid"]    ?? lc["payment_id"]    ?? lc["tranid"]  ?? lc["transid"]  ?? "",
    responseCode: lc["responsecode"] ?? lc["response_code"] ?? lc["authrespcode"] ?? lc["result"] ?? "",
    auth:         lc["authcode"]     ?? lc["auth"]          ?? "",
    ref:          lc["ref"]          ?? "",
  };
}

/** Returns true if the result string indicates a successful captured payment */
function isSuccessResult(result: string): boolean {
  const r = result.trim().toUpperCase();
  // Known success codes from Al Rajhi / Neoleap iPayPipe:
  if (r === "CAPTURED" || r === "APPROVED" || r === "A" || r === "00" || r === "000") return true;
  // Additional codes seen in production:
  if (r === "1" || r === "SUCCESS" || r === "SUCCESSFUL" || r === "OK") return true;
  // Partial match for compound success strings (e.g. "CAPTURED WITH AUTH 123456"):
  if (r.startsWith("CAPTURED") || r.startsWith("APPROVED")) return true;
  return false;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface RajhiPaymentResult {
  redirectUrl: string;
  paymentId: string;
  orderId: string;
}

export interface RajhiInquiryResult {
  /** true if query succeeded (doesn't mean payment succeeded) */
  queried: boolean;
  /** true only if payment was captured/approved */
  successful: boolean;
  /** raw result string from gateway e.g. CAPTURED, NOT CAPTURED */
  result: string;
  /** error message if query failed */
  error?: string;
}

/**
 * Query Al Rajhi iPayPipe for the status of an existing payment (action "8").
 *
 * Use this when the callback was not received or could not be verified,
 * to directly ask the gateway whether a payment succeeded.
 *
 * IMPORTANT: The gateway requires errorURL and responseURL even for inquiry requests.
 * Pass the orderId (trackId from the original initiation) for lookup.
 */
export async function inquireRajhiPayment(params: {
  tranportalId: string;
  tranportalPassword: string;
  resourceKey: string;
  /** The Al Rajhi PaymentID if known, otherwise omit */
  paymentId?: string;
  /** The orderId (trackId) used when initiating the payment — preferred for lookup */
  orderId: string;
  errorUrl: string;
  responseUrl: string;
}): Promise<RajhiInquiryResult> {
  // Build inner plaintext — use trackId (orderId) for lookup since that's what
  // we send during initiation and what the gateway knows as our reference.
  // If we also have the actual Al Rajhi PaymentID, include it as well.
  const innerObj: Record<string, string> = {
    id: params.tranportalId,
    password: params.tranportalPassword,
    action: "8",
    errorURL: params.errorUrl,
    responseURL: params.responseUrl,
    trackId: params.orderId,
  };
  if (params.paymentId && params.paymentId !== params.orderId) {
    innerObj.paymentId = params.paymentId;
  }

  const plaintext = JSON.stringify([innerObj]);
  const trandata = aes256Encrypt(plaintext, params.resourceKey);

  const requestBody = JSON.stringify([{
    id: params.tranportalId,
    trandata,
    errorURL: params.errorUrl,
    responseURL: params.responseUrl,
  }]);

  // [PCI DSS 10.3] Log only non-sensitive metadata, never payment data or keys
  let responseText = "";
  try {
    const response = await fetch(GATEWAY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: requestBody,
    });
    responseText = await response.text();
  } catch (fetchErr: any) {
    console.error("[Rajhi Inquiry] Network error:", fetchErr.message);
    return { queried: false, successful: false, result: "", error: fetchErr.message };
  }

  let parsed: any[];
  try {
    parsed = JSON.parse(responseText);
  } catch {
    return { queried: false, successful: false, result: "", error: `Non-JSON response: ${responseText.slice(0, 100)}` };
  }

  const first = parsed[0];
  if (!first) {
    return { queried: false, successful: false, result: "", error: "Empty response from gateway" };
  }

  // The gateway returns the encrypted result — decrypt it
  const trandataResp = first.result || first.trandata || "";
  if (trandataResp) {
    const attempts = [
      () => aes256Decrypt(trandataResp, params.resourceKey),
      () => aes192Decrypt(trandataResp, params.resourceKey),
    ];
    for (const fn of attempts) {
      try {
        const decrypted = fn();
        let fields: Record<string, string>;
        if (decrypted.trimStart().startsWith("{") || decrypted.trimStart().startsWith("[")) {
          try { const p = JSON.parse(decrypted); fields = Array.isArray(p) ? p[0] : p; }
          catch { fields = parseQS(decrypted); }
        } else {
          fields = parseQS(decrypted);
        }
        const norm = normalizeFields(fields);
        const resultStr = norm.result || norm.responseCode || "";
        return {
          queried: true,
          successful: isSuccessResult(resultStr),
          result: resultStr,
        };
      } catch { /* try next */ }
    }
  }

  // Unencrypted result in some configs — check plain status field
  const plainResult = String(first.result || first.status || "").toUpperCase().trim();
  if (plainResult) {
    return {
      queried: true,
      successful: isSuccessResult(plainResult),
      result: plainResult,
    };
  }

  return { queried: false, successful: false, result: "", error: `Could not parse inquiry response: ${responseText.slice(0, 200)}` };
}

/**
 * Initiate a payment via Al Rajhi / Neoleap iPayPipe API.
 *
 * Makes a server-to-server JSON POST to the gateway, receives a PaymentID,
 * and returns the browser redirect URL (GET to paymentpage.htm?PaymentID=XXX).
 */
export async function initiateRajhiPayment(params: {
  tranportalId: string;
  tranportalPassword: string;
  resourceKey: string;
  amountSAR: number;
  orderId: string;
  approvalUrl: string;
  errorUrl: string;
}): Promise<RajhiPaymentResult> {
  // 1. Build JSON plaintext (confirmed format from Neoleap support)
  const amountStr = params.amountSAR.toFixed(2); // SAR decimal, NOT halalas

  // Derive public base URL from the approvalUrl (e.g. https://example.com/api/... → https://example.com)
  let cssUrl: string | undefined;
  try {
    const u = new URL(params.approvalUrl);
    cssUrl = `${u.protocol}//${u.host}/payment-theme.css`;
  } catch {
    cssUrl = undefined;
  }

  const plaintext = JSON.stringify([{
    id: params.tranportalId,
    password: params.tranportalPassword,
    action: "1",
    currencyCode: "682",
    errorURL: params.errorUrl,
    responseURL: params.approvalUrl,
    trackId: params.orderId,
    amt: amountStr,
    ...(cssUrl ? { css: cssUrl } : {}),
  }]);

  // [PCI DSS 3.4] Sensitive payment data must never be logged in plaintext
  // 2. AES-256-CBC encrypt → HEX
  const trandata = aes256Encrypt(plaintext, params.resourceKey);

  // 3. Server-to-server JSON POST to gateway
  const requestBody = JSON.stringify([{
    id: params.tranportalId,
    trandata,
    errorURL: params.errorUrl,
    responseURL: params.approvalUrl,
  }]);

  const response = await fetch(GATEWAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: requestBody,
  });

  const responseText = await response.text();
  if (response.status !== 200) {
    console.error("[Rajhi] Gateway HTTP error:", response.status);
  }

  // 4. Parse gateway JSON response
  let responseData: Array<{ result?: string; status?: string; errorText?: string }>;
  try {
    responseData = JSON.parse(responseText);
  } catch {
    throw new Error(`Al Rajhi gateway returned non-JSON: ${responseText.slice(0, 300)}`);
  }

  const first = responseData[0];
  if (!first || first.status !== "1") {
    throw new Error(`Al Rajhi gateway error — status: ${first?.status}, errorText: ${first?.errorText}, result: ${first?.result}`);
  }

  // 5. Extract PaymentID and build redirect URL from the gateway response.
  //
  //    CONFIRMED format from Al Rajhi / Neoleap iPayPipe:
  //      "<NUMERIC_PAYMENT_ID>:https://digitalpayments.alrajhibank.com.sa/pg/paymentpage.htm"
  //
  //    Example: "700202608940724314:https://digitalpayments.alrajhibank.com.sa/pg/paymentpage.htm"
  //      → PaymentID = "700202608940724314"   (BEFORE the first colon)
  //      → Base URL  = "https://..."          (AFTER the first colon)
  //      → Redirect  = Base URL + "?PaymentID=700202608940724314"
  //
  //    Fallback: if the result is already a full URL with PaymentID query param, use it directly.
  const resultStr = first.result || "";

  if (!resultStr) {
    throw new Error(`Al Rajhi gateway returned empty result: "${JSON.stringify(first)}"`);
  }

  let paymentId: string;
  let redirectUrl: string;

  if (resultStr.startsWith("http")) {
    // Entire result is already a URL — extract PaymentID from query params if present
    redirectUrl = resultStr;
    try {
      const u = new URL(resultStr);
      paymentId = u.searchParams.get("PaymentID") || "unknown";
    } catch {
      paymentId = "unknown";
    }
  } else {
    // Standard format: "<PaymentID>:<BaseURL>"
    // Use indexOf to find the FIRST colon — the ID is before it, the URL is after it
    const firstColonIdx = resultStr.indexOf(":");
    if (firstColonIdx < 0) {
      // No colon — treat entire string as PaymentID
      paymentId = resultStr.trim();
      redirectUrl = `${GATEWAY_PAGE_URL}?PaymentID=${paymentId}`;
    } else {
      paymentId = resultStr.substring(0, firstColonIdx).trim();
      const baseUrl = resultStr.substring(firstColonIdx + 1).trim();
      // Build the redirect URL: baseUrl already contains the page, append PaymentID as query param
      redirectUrl = `${baseUrl}?PaymentID=${paymentId}`;
    }
  }

  if (!paymentId || !redirectUrl) {
    throw new Error(`Al Rajhi gateway: could not parse PaymentID from result: "${resultStr}"`);
  }

  return { redirectUrl, paymentId, orderId: params.orderId };
}

// ─── Callback verification ────────────────────────────────────────────────────

export interface RajhiCallbackResult {
  /** true if we successfully parsed the callback */
  valid: boolean;
  /** true only when verified that payment was captured */
  successful: boolean;
  /** DECRYPT_ERROR | UNKNOWN_FORMAT | CAPTURED | NOT CAPTURED | etc. */
  responseCode: string;
  orderId?: string;
  paymentId?: string;
  auth?: string;
  ref?: string;
  /** Raw decrypted string for logging */
  decryptedRaw?: string;
}

/**
 * Verify a callback from Al Rajhi gateway after payment.
 *
 * IMPORTANT: If valid=false, the caller must NOT mark the donation as failed —
 * the payment may have succeeded but the callback couldn't be verified.
 * Leave the donation in "pending" state and investigate the logs.
 */
export function verifyRajhiCallback(
  body: Record<string, string>,
  resourceKey: string
): RajhiCallbackResult {

  // ── Simulation (for testing) ──────────────────────────────────────────────
  if (body.TrxToken === "SIMULATED") {
    return {
      valid: true,
      successful: body.Response === "A",
      responseCode: body.Response || "SIM",
      orderId: body.OrderID || body.OrderId,
    };
  }

  // ── Encrypted trandata path ───────────────────────────────────────────────
  // The trandata field may be hex-encoded (standard) or base64-encoded (some configs)
  const trandataRaw = body.trandata || body.TranData || body.TRANDATA || "";
  if (trandataRaw) {
    // aes256Decrypt: HEX encoding (standard Neoleap)
    // aes256DecryptB64: BASE64 encoding (some older configs)
    // aes192Decrypt: AES-192 with HEX (older gateway version)
    const aes256DecryptB64 = (b64: string, key: string) => {
      const keyBuf = Buffer.from(key, "utf8").subarray(0, 32);
      const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuf, Buffer.from(AES_IV, "utf8"));
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(b64.trim(), "base64")),
        decipher.final(),
      ]);
      return decrypted.toString("utf8");
    };
    const attempts: Array<{ label: string; fn: () => string }> = [
      { label: "AES-256/HEX", fn: () => aes256Decrypt(trandataRaw, resourceKey) },
      { label: "AES-256/BASE64", fn: () => aes256DecryptB64(trandataRaw, resourceKey) },
      { label: "AES-192/HEX", fn: () => aes192Decrypt(trandataRaw, resourceKey) },
    ];

    for (const { label, fn } of attempts) {
      try {
        const decrypted = fn();

        // [PCI DSS 3.4] Parse without logging decrypted payment data
        let fields: Record<string, string>;
        if (decrypted.trimStart().startsWith("{") || decrypted.trimStart().startsWith("[")) {
          try {
            const parsed = JSON.parse(decrypted);
            fields = Array.isArray(parsed) ? parsed[0] : parsed;
          } catch {
            fields = parseQS(decrypted);
          }
        } else {
          fields = parseQS(decrypted);
        }

        const norm = normalizeFields(fields);

        return {
          valid: true,
          successful: isSuccessResult(norm.result),
          responseCode: norm.responseCode || norm.result,
          orderId: norm.trackId || undefined,
          paymentId: norm.paymentId || undefined,
          auth: norm.auth || undefined,
          ref: norm.ref || undefined,
          decryptedRaw: decrypted,
        };
      } catch {
        // decryption variant failed — try next
      }
    }

    // All decryption attempts failed
    console.error("[Rajhi Callback] All decryption attempts failed for orderId:", body.OrderID || body.trackid || "unknown");
    return {
      valid: false,
      successful: false,
      responseCode: "DECRYPT_ERROR",
      // Try to get orderId from plain body fields
      orderId: body.OrderID || body.trackid || body.trackId || body.TrackID || body.ref || undefined,
    };
  }

  // ── Plain (unencrypted) callback path ────────────────────────────────────
  // Some Al Rajhi configurations send plain fields without trandata.
  // Also handles the case where trandata exists but is NOT hex/base64 encoded
  // (e.g. Rajhi sends plaintext JSON in trandata field).
  const plainFields: Record<string, string> = { ...body };

  // If we have a trandata that couldn't be decrypted, try parsing it as plain JSON
  if (trandataRaw && !plainFields.result && !plainFields.Result) {
    try {
      const maybeJson = trandataRaw.trim();
      if (maybeJson.startsWith("[") || maybeJson.startsWith("{")) {
        const parsed = JSON.parse(maybeJson);
        const obj = Array.isArray(parsed) ? parsed[0] : parsed;
        Object.assign(plainFields, obj);
      }
    } catch { /* not JSON, skip */ }
  }

  const norm = normalizeFields(plainFields);
  if (norm.result || norm.trackId) {
    return {
      valid: true,
      successful: isSuccessResult(norm.result),
      responseCode: norm.responseCode || norm.result || "PLAIN",
      orderId: norm.trackId || undefined,
      paymentId: norm.paymentId || undefined,
      auth: norm.auth || undefined,
      ref: norm.ref || undefined,
    };
  }

  console.error("[Rajhi Callback] Unrecognized callback format — field count:", Object.keys(body).length);
  return {
    valid: false,
    successful: false,
    responseCode: "UNKNOWN_FORMAT",
  };
}
