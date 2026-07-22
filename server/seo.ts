import type { Request, Response, NextFunction } from "express";
import { Db } from "mongodb";

const SITE_NAME = "جمعية طويق للخدمات الإنسانية";
const SITE_NAME_EN = "Tuwaiq Humanitarian Services Association";
const BASE_URL_DEFAULT = "https://tuwaiqassociation.sa";
const DEFAULT_OG_IMAGE = "/images/og-main.png";
const TWITTER_HANDLE = "@tuwaiq_2o3o";

const SITE_DESC_DEFAULT =
  "جمعية طويق للخدمات الإنسانية — جمعية خيرية سعودية مرخصة في الرياض، تُقدّم برامج سقيا الماء وإطعام الجائع وإفطار الصائم والسلة الرمضانية وكفالة الأسر والحالات الخاصة. تبرّع الآن وكن شريكاً في صنع الفرق.";

const KEYWORDS_BASE =
  "جمعية طويق, طويق, جمعية طويق للخدمات الإنسانية, طويق للخدمات الإنسانية, طويق للخدمات الإنسانيه, جمعية طويق الانسانية, جمعية طويق للخدمات الانسانية, طويق الخيرية, جمعية طويق الخيرية, طويق للخدمات, جمعية طويق الرياض, tuwaiq association, tuwaiq humanitarian, tuwaiq charity, جمعية خيرية رياض, جمعية في السويدي, جمعية السويدي الرياض, أشهر جمعية في الرياض, أفضل جمعية خيرية في الرياض, التبرع في الرياض, جمعية إنسانية معتمدة, جمعية خيرية معتمدة السعودية, دعم المحتاجين الرياض, تبرع اونلاين السعودية, صدقة جارية الرياض, كفالة عمرة, كفالة معتمر";

// Static SEO data per route
const STATIC_SEO: Record<string, { title: string; description: string; image: string; keywords?: string }> = {
  "/": {
    title: "جمعية طويق للخدمات الإنسانية | الجمعية الخيرية الأولى في الرياض",
    description: SITE_DESC_DEFAULT,
    image: DEFAULT_OG_IMAGE,
    keywords: `${KEYWORDS_BASE}, تبرع, زكاة, صدقة, خيرية, إنسانية, السعودية, الرياض, سقيا الماء, إطعام, العريجاء`,
  },
  "/donate": {
    title: `تبرع الآن | جمعية طويق للخدمات الإنسانية`,
    description:
      "تبرّع عبر جمعية طويق للخدمات الإنسانية بكل سهولة — بوابة دفع آمنة تدعم Visa / Mastercard / Apple Pay / مدى. صدقتك تصل مباشرة للمحتاجين في المملكة العربية السعودية.",
    image: "/images/og-banner2.png",
    keywords: `${KEYWORDS_BASE}, تبرع, صدقة, زكاة, مدى, Apple Pay, بوابة دفع آمنة, دعم إنساني`,
  },
  "/bank-transfer": {
    title: `تبرع بنكي | جمعية طويق للخدمات الإنسانية`,
    description:
      "تبرّع لجمعية طويق للخدمات الإنسانية عبر التحويل البنكي المباشر — حسابات IBAN معتمدة لدى الراجحي والبنك العربي الوطني وبنك البلاد.",
    image: DEFAULT_OG_IMAGE,
    keywords: `${KEYWORDS_BASE}, تحويل بنكي, IBAN, الراجحي, بنك البلاد, تبرع بنكي`,
  },
  "/services": {
    title: `خدمات جمعية طويق الإنسانية | سقيا الماء والإطعام والكفالة`,
    description:
      "جمعية طويق للخدمات الإنسانية تُقدّم: سقيا الماء، إطعام الجائع، إفطار الصائم، السلة الرمضانية، كفالة الأسر، والحالات الخاصة — تبرّع وساهم في إيصال الخير.",
    image: "/images/og-water.png",
    keywords: `${KEYWORDS_BASE}, سقيا الماء, إطعام الجائع, إفطار صائم, سلة رمضانية, كفالة, خدمات إنسانية`,
  },
  "/services/water": {
    title: `سقيا الماء | جمعية طويق للخدمات الإنسانية`,
    description:
      "مشروع سقيا الماء من جمعية طويق للخدمات الإنسانية — صدقة جارية تمتد أثرها. ساهم في توفير المياه النظيفة للمحتاجين في المملكة العربية السعودية.",
    image: "/images/og-water.png",
    keywords: `${KEYWORDS_BASE}, سقيا الماء, صدقة جارية, مياه, بئر, تبرع`,
  },
  "/services/ramadan-basket": {
    title: `السلة الرمضانية | جمعية طويق للخدمات الإنسانية`,
    description:
      "جمعية طويق للخدمات الإنسانية توزّع السلة الرمضانية على الأسر المحتاجة في شهر رمضان المبارك — تبرّع وأدخل الفرحة على بيوت المحتاجين.",
    image: "/images/og-ramadan.png",
    keywords: `${KEYWORDS_BASE}, سلة رمضانية, رمضان, مواد غذائية, أسر محتاجة, إطعام`,
  },
  "/services/iftar": {
    title: `إفطار صائم | جمعية طويق للخدمات الإنسانية`,
    description:
      "من فطّر صائماً كان له مثل أجره — شارك في مشروع إفطار الصائم مع جمعية طويق للخدمات الإنسانية وكن شريكاً في الأجر.",
    image: "/images/og-iftar.png",
    keywords: `${KEYWORDS_BASE}, إفطار صائم, إطعام, رمضان, موائد رمضان, صدقة`,
  },
  "/services/special-cases": {
    title: `الحالات الخاصة | جمعية طويق للخدمات الإنسانية`,
    description:
      "جمعية طويق للخدمات الإنسانية تدعم الحالات الإنسانية الطارئة والأسر الأكثر احتياجاً — نصل إلى المحتاجين في أصعب ظروفهم.",
    image: DEFAULT_OG_IMAGE,
    keywords: `${KEYWORDS_BASE}, حالات خاصة, طوارئ إنسانية, دعم, أسر محتاجة`,
  },
  "/campaigns": {
    title: `المشاريع الإنسانية | جمعية طويق للخدمات الإنسانية`,
    description:
      "جمعية طويق للخدمات الإنسانية تُطلق حملات خيرية متنوعة لدعم المحتاجين في المملكة العربية السعودية — تبرّع وكن شريكاً في صنع الفرق.",
    image: "/images/og-main.png",
    keywords: `${KEYWORDS_BASE}, مشاريع إنسانية, حملات خيرية, تبرع, خير`,
  },
  "/donate?campaignId=umrah": {
    title: `كفالة عمرة | جمعية طويق للخدمات الإنسانية`,
    description:
      "ساهم في كفالة معتمر وأدخله بيت الله الحرام — كفالة العمرة من جمعية طويق للخدمات الإنسانية. التبرع من 100 إلى 3000 ريال، كفالة معتمر كاملة بـ 3000 ريال.",
    image: "/images/og-main.png",
    keywords: `${KEYWORDS_BASE}, كفالة عمرة, كفالة معتمر, عمرة, بيت الله, تبرع للعمرة`,
  },
  "/donate?campaignId=orphan": {
    title: `كفالة يتيم | جمعية طويق للخدمات الإنسانية`,
    description:
      "أنا وكافل اليتيم كهاتين في الجنة — كفالة اليتيم من جمعية طويق للخدمات الإنسانية في الرياض. ساهم في رعاية الأيتام وإدخال السعادة على قلوبهم.",
    image: "/images/og-main.png",
    keywords: `${KEYWORDS_BASE}, كفالة يتيم, أيتام, رعاية الأيتام, صدقة, ثواب`,
  },
  "/donate?campaignId=families": {
    title: `كفالة أسر أرامل | جمعية طويق للخدمات الإنسانية`,
    description:
      "كفالة الأسر الأرامل والمحتاجة من جمعية طويق للخدمات الإنسانية — ساهم في إعانة الأسر الأكثر احتياجاً في الرياض.",
    image: "/images/og-main.png",
    keywords: `${KEYWORDS_BASE}, كفالة أسر, أرامل, أسر محتاجة, دعم اجتماعي, تبرع`,
  },
  "/about": {
    title: `من نحن | جمعية طويق للخدمات الإنسانية`,
    description:
      "جمعية طويق للخدمات الإنسانية جمعية أهلية سعودية مرخصة — رقم التصريح 1000820300 — تخدم المجتمع في الرياض منذ 2025. رسالتنا نشر الخير والتكافل الاجتماعي.",
    image: DEFAULT_OG_IMAGE,
    keywords: `${KEYWORDS_BASE}, من نحن, تصريح 1000820300, جمعية أهلية, سعودية, الرياض`,
  },
  "/contact": {
    title: `تواصل مع جمعية طويق للخدمات الإنسانية`,
    description:
      "تواصل مع جمعية طويق للخدمات الإنسانية — الرياض، العريجاء الوسطى، شارع يزيد بن أبي سفيان — هاتف: 0505793012.",
    image: DEFAULT_OG_IMAGE,
    keywords: `${KEYWORDS_BASE}, تواصل, اتصال, عنوان جمعية طويق, الرياض, العريجاء`,
  },
  "/leaderboard": {
    title: `قائمة شرف المتبرعين | جمعية طويق للخدمات الإنسانية`,
    description:
      "كن من السباقين في قائمة شرف المتبرعين الكرام في جمعية طويق للخدمات الإنسانية — تبرّع واسبق إلى الخير.",
    image: "/images/og-banner1.png",
    keywords: `${KEYWORDS_BASE}, قائمة شرف, متبرعون, تكريم, خير`,
  },
  "/volunteer": {
    title: `تطوع في جمعية طويق للخدمات الإنسانية`,
    description:
      "انضم إلى فريق متطوعي جمعية طويق للخدمات الإنسانية وساهم في خدمة المجتمع — فرص تطوعية متنوعة في الرياض.",
    image: DEFAULT_OG_IMAGE,
    keywords: `${KEYWORDS_BASE}, تطوع, متطوعين, خدمة مجتمعية, الرياض`,
  },
  "/jobs": {
    title: `فرص التوظيف | جمعية طويق للخدمات الإنسانية`,
    description:
      "انضم إلى فريق جمعية طويق للخدمات الإنسانية وكن جزءاً من رسالتنا الإنسانية — وظائف ومسارات مهنية هادفة.",
    image: DEFAULT_OG_IMAGE,
    keywords: `${KEYWORDS_BASE}, توظيف, وظائف, فرص عمل, الرياض`,
  },
  "/zakat": {
    title: `حاسبة الزكاة | جمعية طويق للخدمات الإنسانية`,
    description:
      "احسب زكاة مالك بدقة وادفعها عبر جمعية طويق للخدمات الإنسانية — نضمن وصولها للمستحقين.",
    image: DEFAULT_OG_IMAGE,
    keywords: `${KEYWORDS_BASE}, زكاة, حاسبة الزكاة, زكاة المال, فريضة`,
  },
  "/impact": {
    title: `أثر التبرعات | جمعية طويق للخدمات الإنسانية`,
    description:
      "تعرّف على الأثر الفعلي لتبرعاتك في حياة المستفيدين من جمعية طويق للخدمات الإنسانية — شفافية كاملة ونتائج موثّقة.",
    image: DEFAULT_OG_IMAGE,
    keywords: `${KEYWORDS_BASE}, أثر, مستفيدون, شفافية, نتائج, تقارير`,
  },
};

// ── Schemas ────────────────────────────────────────────────────────────────────

function buildOrganizationSchema(baseUrl: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["NGO", "Organization"],
        "@id": `${baseUrl}/#organization`,
        "name": SITE_NAME,
        "legalName": "جمعية طويق للخدمات الإنسانية",
        "alternateName": [
          SITE_NAME_EN,
          "طويق للخدمات الإنسانية",
          "جمعية طويق الخيرية",
          "طويق الخيرية",
          "Tuwaiq Association",
        ],
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/favicon.png`,
          "width": 128,
          "height": 128,
        },
        "image": `${baseUrl}/images/og-banner1.png`,
        "description": SITE_DESC_DEFAULT,
        "foundingDate": "2025",
        "taxID": "1000820300",
        "identifier": {
          "@type": "PropertyValue",
          "name": "رقم الترخيص",
          "value": "1000820300",
        },
        "areaServed": {
          "@type": "Country",
          "name": "Saudi Arabia",
        },
        "knowsAbout": [
          "سقيا الماء",
          "إطعام الجائع",
          "إفطار الصائم",
          "السلة الرمضانية",
          "كفالة الأسر",
          "الحالات الخاصة",
          "التبرعات الخيرية",
          "الزكاة",
        ],
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "SA",
          "addressRegion": "الرياض",
          "addressLocality": "العريجاء الوسطى",
          "streetAddress": "شارع يزيد بن أبي سفيان",
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 24.6877,
          "longitude": 46.6516,
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+966505793012",
            "contactType": "customer support",
            "availableLanguage": "Arabic",
            "areaServed": "SA",
          },
          {
            "@type": "ContactPoint",
            "telephone": "+966505793012",
            "contactType": "donations",
            "availableLanguage": "Arabic",
            "areaServed": "SA",
          },
        ],
        "sameAs": [
          "https://twitter.com/tuwaiq_2o3o",
          "https://x.com/tuwaiq_2o3o",
          "https://instagram.com/tuwaiq_2o3o",
          "https://www.instagram.com/tuwaiq_2o3o",
          "https://facebook.com/tuwaiq_2o3o",
          "https://www.facebook.com/tuwaiq_2o3o",
          "https://youtube.com/@tuwaiq_2o3o",
          "https://www.youtube.com/@tuwaiq_2o3o",
          "https://snapchat.com/add/tuwaiq_2o3o",
          "https://tiktok.com/@tuwaiq_2o3o",
          "https://www.tiktok.com/@tuwaiq_2o3o",
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "برامج جمعية طويق الإنسانية",
          "itemListElement": [
            { "@type": "Offer", "name": "سقيا الماء", "url": `${baseUrl}/services/water` },
            { "@type": "Offer", "name": "إطعام الجائع", "url": `${baseUrl}/services` },
            { "@type": "Offer", "name": "إفطار الصائم", "url": `${baseUrl}/services/iftar` },
            { "@type": "Offer", "name": "السلة الرمضانية", "url": `${baseUrl}/services/ramadan-basket` },
            { "@type": "Offer", "name": "الحالات الخاصة", "url": `${baseUrl}/services/special-cases` },
          ],
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${baseUrl}/#localbusiness`,
        "name": SITE_NAME,
        "url": baseUrl,
        "telephone": "+966505793012",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "SA",
          "addressRegion": "الرياض",
          "addressLocality": "العريجاء الوسطى",
          "streetAddress": "شارع يزيد بن أبي سفيان",
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 24.6877,
          "longitude": 46.6516,
        },
        "image": `${baseUrl}/images/og-banner1.png`,
        "openingHours": "Sa-Th 09:00-21:00",
        "priceRange": "مجاني",
        "currenciesAccepted": "SAR",
        "paymentAccepted": "Online, Bank Transfer",
      },
    ],
  });
}

function buildWebsiteSchema(baseUrl: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    "url": baseUrl,
    "name": SITE_NAME,
    "inLanguage": "ar",
    "publisher": { "@id": `${baseUrl}/#organization` },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/campaigns?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });
}

function buildBreadcrumbSchema(path: string, label: string, baseUrl: string): string {
  const items: any[] = [
    { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": baseUrl },
  ];
  if (path !== "/") {
    items.push({ "@type": "ListItem", "position": 2, "name": label, "item": `${baseUrl}${path}` });
  }
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items,
  });
}

function buildDonateSchema(baseUrl: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "DonateAction",
    "name": "تبرع لجمعية طويق للخدمات الإنسانية",
    "description": "تبرّع عبر جمعية طويق للخدمات الإنسانية — بوابة دفع آمنة تدعم Visa / Mastercard / Apple Pay / مدى",
    "url": `${baseUrl}/donate`,
    "recipient": { "@id": `${baseUrl}/#organization` },
  });
}

function buildHomeFAQSchema(baseUrl: string): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "ما هي جمعية طويق للخدمات الإنسانية؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "جمعية طويق للخدمات الإنسانية جمعية أهلية سعودية مرخصة برقم تصريح 1000820300، تقع في الرياض - العريجاء الوسطى. تهدف إلى تقديم الدعم الإنساني للمحتاجين من خلال برامج متنوعة كسقيا الماء وإطعام الجائع وإفطار الصائم والسلة الرمضانية وكفالة الأسر.",
        },
      },
      {
        "@type": "Question",
        "name": "كيف أتبرع لجمعية طويق؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `يمكنك التبرع لجمعية طويق للخدمات الإنسانية عبر بوابة الدفع الإلكترونية على الموقع بكل سهولة، أو عبر التحويل البنكي المباشر. نقبل Visa / Mastercard / Apple Pay / مدى. زيارة ${baseUrl}/donate`,
        },
      },
      {
        "@type": "Question",
        "name": "ما برامج جمعية طويق الإنسانية؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "تُقدّم جمعية طويق للخدمات الإنسانية برامج: سقيا الماء (صدقة جارية)، إطعام الجائع، إفطار الصائم، السلة الرمضانية، كفالة الأسر، والحالات الخاصة الطارئة.",
        },
      },
      {
        "@type": "Question",
        "name": "ما رقم هاتف جمعية طويق للتواصل؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "رقم التواصل مع جمعية طويق للخدمات الإنسانية: 0505793012 — أو تواصل معنا عبر الموقع الرسمي tuwaiqassociation.sa",
        },
      },
      {
        "@type": "Question",
        "name": "أين مقر جمعية طويق للخدمات الإنسانية؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "يقع مقر جمعية طويق للخدمات الإنسانية في الرياض — العريجاء الوسطى، شارع يزيد بن أبي سفيان، المملكة العربية السعودية.",
        },
      },
      {
        "@type": "Question",
        "name": "ما هو موقع طويق الخيرية؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "الموقع الرسمي لجمعية طويق (طويق الخيرية، طويق للخدمات الإنسانية) هو tuwaiqassociation.sa — يمكنك التبرع وتتبع حملاتنا الخيرية مباشرة من الموقع.",
        },
      },
      {
        "@type": "Question",
        "name": "هل جمعية طويق معتمدة رسمياً في السعودية؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "نعم، جمعية طويق للخدمات الإنسانية جمعية أهلية سعودية مرخصة رسمياً برقم تصريح 1000820300 من الجهات السعودية المختصة.",
        },
      },
      {
        "@type": "Question",
        "name": "ما الفرق بين جمعية طويق وطويق للخدمات الإنسانية؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "جمعية طويق وطويق للخدمات الإنسانية وطويق الخيرية وجمعية طويق الإنسانية — كلها أسماء تشير إلى نفس الجمعية الخيرية: جمعية طويق للخدمات الإنسانية، ومقرها الرياض، المملكة العربية السعودية.",
        },
      },
    ],
  });
}

// ── Bot detection ──────────────────────────────────────────────────────────────

const BOT_AGENTS = [
  "facebookexternalhit", "facebookbot", "twitterbot", "linkedinbot",
  "telegrambot", "googlebot", "bingbot", "slackbot", "discordbot",
  "applebot", "ia_archiver", "vkshare", "outbrain",
  "pinterest", "w3c_validator", "semrushbot", "ahrefsbot", "mj12bot",
  "rogerbot", "dotbot", "yandexbot", "baiduspider", "duckduckbot",
  "sogou", "exabot", "facebot", "bytespider", "gptbot",
  "chatgpt-user", "claudebot", "petalbot", "seekerbot",
];

// Social-media link-preview crawlers that do NOT have a real browser engine in their UA.
// Their in-app browsers DO include "Mozilla"/"AppleWebKit"/"Chrome" — distinguished below.
// whatsapp: WhatsApp's preview bot has no browser engine; in-app browser uses Chrome/Safari UA
// snapchat: Snapchat preview bot has no browser engine; in-app browser has Mozilla + AppleWebKit
const PREVIEW_ONLY_AGENTS = ["snapchat", "whatsapp", "instagram", "tiktok", "preview"];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  // Always treat known pure-bot UAs as bots
  if (BOT_AGENTS.some((bot) => ua.includes(bot))) return true;
  // Treat social-preview crawlers as bots ONLY when they don't carry a real browser engine.
  // Snapchat's in-app browser includes "Mozilla"/"AppleWebKit"/"Chrome" in its UA;
  // the Snapchat link-preview crawler typically does NOT — so we distinguish them here.
  const hasBrowserEngine = ua.includes("mozilla") || ua.includes("applewebkit") || ua.includes("chrome");
  if (!hasBrowserEngine && PREVIEW_ONLY_AGENTS.some((a) => ua.includes(a))) return true;
  return false;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildHtml(params: {
  title: string;
  description: string;
  image: string;
  url: string;
  canonical: string;
  keywords?: string;
  extraSchemas?: string[];
  label?: string;
  path?: string;
}): string {
  const { title, description, image, url, canonical, keywords, extraSchemas = [], label, path = "/" } = params;
  const absImage = image.startsWith("http") ? image : `${url}${image}`;
  const pageLabel = label || title.split("|")[0].trim();

  const isHome = path === "/";

  const schemas = [
    buildOrganizationSchema(url),
    buildWebsiteSchema(url),
    buildBreadcrumbSchema(path, pageLabel, url),
    ...(isHome ? [buildHomeFAQSchema(url)] : []),
    ...(path === "/donate" ? [buildDonateSchema(url)] : []),
    ...extraSchemas,
  ];

  const noscriptText = `
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(description)}</p>
    <p>جمعية طويق للخدمات الإنسانية — طويق للخدمات الإنسانية — جمعية طويق الخيرية — رقم التصريح: 1000820300 — الرياض، المملكة العربية السعودية</p>
    <nav>
      <a href="${escapeHtml(url)}">الرئيسية</a> |
      <a href="${escapeHtml(url)}/donate">تبرع الآن</a> |
      <a href="${escapeHtml(url)}/services">الخدمات</a> |
      <a href="${escapeHtml(url)}/campaigns">المشاريع</a> |
      <a href="${escapeHtml(url)}/about">من نحن</a> |
      <a href="${escapeHtml(url)}/contact">تواصل معنا</a>
    </nav>
    <a href="${escapeHtml(canonical)}">زيارة الصفحة</a>
  `;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ""}
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta name="author" content="${escapeHtml(SITE_NAME)}" />
  <meta name="language" content="ar" />
  <meta name="geo.region" content="SA-01" />
  <meta name="geo.placename" content="الرياض" />
  <meta name="google-site-verification" content="MIvsD-QbWVbmAGAcln7-MSJsw-LIlkQ3TmZB-5MTlLs" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(absImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(SITE_NAME)}" />
  <meta property="og:url" content="${escapeHtml(canonical)}" />
  <meta property="og:locale" content="ar_SA" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="${escapeHtml(TWITTER_HANDLE)}" />
  <meta name="twitter:creator" content="${escapeHtml(TWITTER_HANDLE)}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(absImage)}" />
  <meta name="twitter:image:alt" content="${escapeHtml(SITE_NAME)}" />

  <!-- Structured Data -->
  ${schemas.map((s) => `<script type="application/ld+json">${s}</script>`).join("\n  ")}

  <meta http-equiv="refresh" content="0;url=${escapeHtml(canonical)}" />
</head>
<body>
  <noscript>${noscriptText}</noscript>
</body>
</html>`;
}

export function createSEOMiddleware(db: Db) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api/")) return next();
    if (req.path.startsWith("/assets/")) return next();
    if (req.path.startsWith("/images/")) return next();
    if (req.path.includes(".")) return next();

    const ua = req.headers["user-agent"] || "";
    if (!isBot(ua)) return next();

    const path = req.path;
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const canonical = `${baseUrl}${path}`;

    let seoData: { title: string; description: string; image: string; keywords?: string } | null = null;

    const DB_TIMEOUT = 3000; // 3 seconds max per DB query — prevent hanging on slow connections
    const withTimeout = <T>(promise: Promise<T>): Promise<T | null> =>
      Promise.race([promise, new Promise<null>((resolve) => setTimeout(() => resolve(null), DB_TIMEOUT))]);

    // 1. DB overrides first
    try {
      const dbOverride = await withTimeout(db.collection("seo_overrides").findOne({ path }));
      if (dbOverride?.title) {
        seoData = {
          title: dbOverride.title,
          description: dbOverride.description || SITE_DESC_DEFAULT,
          image: dbOverride.image || DEFAULT_OG_IMAGE,
          keywords: dbOverride.keywords,
        };
      }
    } catch {}

    // 2. Dynamic: /services/:slug
    if (!seoData) {
      const serviceMatch = path.match(/^\/services\/(.+)$/);
      if (serviceMatch) {
        try {
          const service = await withTimeout(db.collection("services").findOne({ slug: serviceMatch[1] }));
          if (service) {
            seoData = {
              title: `${service.title} | ${SITE_NAME}`,
              description:
                service.metaDescription ||
                `${service.title} من جمعية طويق للخدمات الإنسانية — ${service.description || "ساهم في الخير وتبرّع الآن."}`,
              image: service.ogImage || service.imageUrl || DEFAULT_OG_IMAGE,
              keywords:
                service.metaKeywords ||
                `${KEYWORDS_BASE}, ${service.title}, تبرع`,
            };
          }
        } catch {}
      }
    }

    // 3. Dynamic: /campaigns/:slug
    if (!seoData) {
      const campaignMatch = path.match(/^\/campaigns\/(.+)$/);
      if (campaignMatch) {
        try {
          const campaign = await withTimeout(db.collection("campaigns").findOne({ slug: campaignMatch[1] }));
          if (campaign) {
            const name = campaign.name || campaign.title;
            seoData = {
              title: `${name} | ${SITE_NAME}`,
              description:
                campaign.metaDescription ||
                `${name} — حملة خيرية من جمعية طويق للخدمات الإنسانية. ${campaign.description || "تبرّع الآن وكن شريكاً في صنع الفرق."}`,
              image: campaign.ogImage || campaign.imageUrl || DEFAULT_OG_IMAGE,
              keywords: `${KEYWORDS_BASE}, ${name}, حملة, تبرع`,
            };
          }
        } catch {}
      }
    }

    // 4. Dynamic: /news/:slug or /content/:slug or /page/:slug
    if (!seoData) {
      const contentMatch = path.match(/^\/(?:news|content|page)\/(.+)$/);
      if (contentMatch) {
        try {
          const article = await withTimeout(db.collection("content").findOne({ slug: contentMatch[1] }));
          if (article) {
            seoData = {
              title: `${article.title} | ${SITE_NAME}`,
              description:
                article.metaDescription ||
                article.excerpt ||
                article.content?.replace(/<[^>]+>/g, "").slice(0, 155) ||
                SITE_DESC_DEFAULT,
              image: article.ogImage || article.imageUrl || DEFAULT_OG_IMAGE,
              keywords: `${KEYWORDS_BASE}, ${article.title}`,
            };
          }
        } catch {}
      }
    }

    // 5. Static map
    if (!seoData && STATIC_SEO[path]) {
      seoData = { ...STATIC_SEO[path] };
    }

    // 6. Fallback
    if (!seoData) {
      seoData = {
        title: SITE_NAME,
        description: SITE_DESC_DEFAULT,
        image: DEFAULT_OG_IMAGE,
        keywords: KEYWORDS_BASE,
      };
    }

    const html = buildHtml({
      title: seoData.title,
      description: seoData.description,
      image: seoData.image,
      url: baseUrl,
      canonical,
      keywords: seoData.keywords,
      path,
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
    res.status(200).send(html);
    } catch (err) {
      // On any unexpected error, fall through to normal Express handling
      console.error("[SEO middleware] unexpected error:", (err as any)?.message);
      next();
    }
  };
}

// ── Sitemap.xml ────────────────────────────────────────────────────────────────
function xmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const STATIC_PAGES = [
  { loc: "/", priority: "1.0", changefreq: "daily" },
  { loc: "/donate", priority: "0.9", changefreq: "weekly" },
  { loc: "/bank-transfer", priority: "0.8", changefreq: "monthly" },
  { loc: "/services", priority: "0.9", changefreq: "weekly" },
  { loc: "/campaigns", priority: "0.9", changefreq: "daily" },
  { loc: "/about", priority: "0.8", changefreq: "monthly" },
  { loc: "/contact", priority: "0.7", changefreq: "monthly" },
  { loc: "/leaderboard", priority: "0.6", changefreq: "daily" },
  { loc: "/volunteer", priority: "0.7", changefreq: "monthly" },
  { loc: "/jobs", priority: "0.6", changefreq: "weekly" },
  { loc: "/zakat", priority: "0.7", changefreq: "monthly" },
  { loc: "/impact", priority: "0.7", changefreq: "weekly" },
  { loc: "/bank-accounts", priority: "0.5", changefreq: "monthly" },
];

export function registerSitemapRoute(app: any, db: Db) {
  app.get("/sitemap.xml", async (req: Request, res: Response) => {
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const now = new Date().toISOString().split("T")[0];

    const urls: { loc: string; lastmod: string; changefreq: string; priority: string }[] =
      STATIC_PAGES.map((p) => ({
        loc: `${baseUrl}${p.loc}`,
        lastmod: now,
        changefreq: p.changefreq,
        priority: p.priority,
      }));

    // Dynamic: services
    try {
      const services = await db.collection("services").find({ isActive: { $ne: false } }).toArray();
      for (const s of services) {
        if (s.slug) {
          urls.push({
            loc: `${baseUrl}/services/${xmlEscape(s.slug)}`,
            lastmod: s.updatedAt ? new Date(s.updatedAt).toISOString().split("T")[0] : now,
            changefreq: "weekly",
            priority: "0.8",
          });
        }
      }
    } catch {}

    // Dynamic: campaigns
    try {
      const campaigns = await db.collection("campaigns").find({ isActive: { $ne: false } }).toArray();
      for (const c of campaigns) {
        if (c.slug) {
          urls.push({
            loc: `${baseUrl}/campaigns/${xmlEscape(c.slug)}`,
            lastmod: c.updatedAt ? new Date(c.updatedAt).toISOString().split("T")[0] : now,
            changefreq: "daily",
            priority: "0.8",
          });
        }
      }
    } catch {}

    // Dynamic: content pages
    try {
      const pages = await db.collection("content").find({ isPublished: { $ne: false } }).toArray();
      for (const p of pages) {
        if (p.slug && !["admin", "employee", "login"].includes(p.slug)) {
          urls.push({
            loc: `${baseUrl}/page/${xmlEscape(p.slug)}`,
            lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split("T")[0] : now,
            changefreq: "monthly",
            priority: "0.5",
          });
        }
      }
    } catch {}

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
    res.status(200).send(xml);
  });
}

// ── Admin SEO routes ───────────────────────────────────────────────────────────
export function registerSEORoutes(app: any, db: Db) {
  app.get("/api/admin/seo", async (req: Request, res: Response) => {
    try {
      const overrides = await db.collection("seo_overrides").find({}).toArray();
      res.json({ overrides, staticRoutes: Object.keys(STATIC_SEO) });
    } catch {
      res.status(500).json({ message: "خطأ في جلب إعدادات SEO" });
    }
  });

  app.put("/api/admin/seo", async (req: Request, res: Response) => {
    try {
      const rawPath = (req.query.path as string) || "";
      const path = rawPath.startsWith("/") ? rawPath : "/" + rawPath;
      const { title, description, image, keywords } = req.body;
      await db.collection("seo_overrides").updateOne(
        { path },
        { $set: { path, title, description, image, keywords, updatedAt: new Date() } },
        { upsert: true }
      );
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "خطأ في حفظ إعدادات SEO" });
    }
  });

  app.delete("/api/admin/seo", async (req: Request, res: Response) => {
    try {
      const rawPath = (req.query.path as string) || "";
      const path = rawPath.startsWith("/") ? rawPath : "/" + rawPath;
      await db.collection("seo_overrides").deleteOne({ path });
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "خطأ في حذف إعداد SEO" });
    }
  });
}
