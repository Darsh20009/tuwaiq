import { useEffect } from "react";

interface SEOOptions {
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  url?: string;
}

const SITE_NAME = "جمعية طويق للخدمات الإنسانية";
const BASE_URL = window.location.origin;
const DEFAULT_IMAGE = `${BASE_URL}/images/og-banner1.png`;

function setMeta(property: string, content: string, isName = false) {
  const attr = isName ? "name" : "property";
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function useSEO({ title, description, image, type = "website", url }: SEOOptions) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const finalDesc = description || "جمعية طويق للخدمات الإنسانية — نسعى لتقديم الدعم للمحتاجين من خلال برامج متنوعة";
    const finalImage = image ? (image.startsWith("http") ? image : `${BASE_URL}${image}`) : DEFAULT_IMAGE;
    const finalUrl = url || window.location.href;

    // Page title
    document.title = fullTitle;

    // Basic meta
    setMeta("description", finalDesc, true);

    // Open Graph
    setMeta("og:title", fullTitle);
    setMeta("og:description", finalDesc);
    setMeta("og:image", finalImage);
    setMeta("og:image:width", "1200");
    setMeta("og:image:height", "630");
    setMeta("og:url", finalUrl);
    setMeta("og:type", type);
    setMeta("og:site_name", SITE_NAME);
    setMeta("og:locale", "ar_SA");

    // Twitter Card
    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", fullTitle, true);
    setMeta("twitter:description", finalDesc, true);
    setMeta("twitter:image", finalImage, true);
    setMeta("twitter:site", "@tuwaiq_2o3o", true);
    setMeta("twitter:creator", "@tuwaiq_2o3o", true);

    return () => {
      document.title = SITE_NAME;
    };
  }, [title, description, image, type, url]);
}
