import { Request, Response } from "express";
import * as paymentsService from "./payments.service";
import { handleError } from "../../core/errors";

export async function initiateRajhi(req: Request, res: Response): Promise<void> {
  try {
    const currentUser = (req as any).currentUser;
    const result = await paymentsService.initiateRajhi({
      ...req.body,
      userId: currentUser?.userId,
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    const msg: string = err?.message || "";
    if (msg.startsWith("GATEWAY_ERROR:")) {
      const gatewayMsg = msg.replace("GATEWAY_ERROR:", "").trim();
      res.status(402).json({
        success: false,
        code: "GATEWAY_ERROR",
        message: `خطأ من بوابة الدفع: ${gatewayMsg}`,
        detail: gatewayMsg,
      });
      return;
    }
    handleError(err, res);
  }
}

export async function rajhiCallback(req: Request, res: Response): Promise<void> {
  let donationId: string | undefined;
  try {
    const result = await paymentsService.handleRajhiCallback(req.body);
    if (typeof result === "string") donationId = result;
  } catch (_) {
    // ignore processing errors — always thank the donor
  }
  const redirectBase = process.env.BASE_URL || "";
  const idParam = donationId ? `&id=${encodeURIComponent(donationId)}` : "";
  res.redirect(`${redirectBase}/payment-result?status=success${idParam}`);
}

export async function initiateBankTransfer(req: Request, res: Response): Promise<void> {
  try {
    const currentUser = (req as any).currentUser;
    const result = await paymentsService.initiateBankTransfer({
      ...req.body,
      userId: currentUser?.userId,
    });
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    handleError(err, res);
  }
}

export async function getPayments(req: Request, res: Response): Promise<void> {
  try {
    const { provider, status } = req.query;
    const payments = await paymentsService.getPayments({
      provider: provider as string,
      status: status as string,
    });
    res.json({ success: true, payments });
  } catch (err) {
    handleError(err, res);
  }
}
