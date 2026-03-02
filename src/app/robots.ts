import { MetadataRoute } from "next";

const SITE_URL = "https://networkajob.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/debug", "/debug-oauth", "/debug-linkedin-oauth", "/test-oauth", "/test-linkedin-oauth", "/test-redirect-uri", "/connections"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
