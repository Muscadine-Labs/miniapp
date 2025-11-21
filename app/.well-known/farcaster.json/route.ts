import { minikitConfig } from "../../../minikit.config";

/**
 * Manifest endpoint for Base MiniApp
 * @see https://docs.base.org/mini-apps/quickstart/migrate-existing-apps
 * 
 * The manifest must include three sections:
 * - accountAssociation: Domain ownership verification (empty initially, populated via Base Build tool)
 * - baseBuilder: Base Build account connection
 * - miniapp: MiniApp metadata and configuration
 */
export async function GET() {
  // Always use production domain for manifest URLs (required by Farcaster)
  // Never use Vercel preview URLs as they're not valid for manifest validation
  const baseUrl = "https://miniapp.muscadine.io";

  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjIwNjQzNywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDUzNTBFMjQ5M0ZFZmEwRGJlRTY0ZTliYWM3MGVGNTUzNjk1MWRkMjQifQ",
      payload: "eyJkb21haW4iOiJtaW5pYXBwLm11c2NhZGluZS5pbyJ9",
      signature: "cEUOad3+hgxaE+gdNcxM7q2i9DIuQd49UZ4Qtm8iXcEueprpXWL0RM41BW1umWjtEk8Inlr0XvoX2RqNm2tLRhw="
    },
    baseBuilder: {
      ownerAddress: "0x31E70f063cA802DedCd76e74C8F6D730eC43D9f0"
    },
    frame: {
      name: "Muscadine",
      version: "1",
      iconUrl: "https://miniapp.muscadine.io/icon.png",
      homeUrl: "https://miniapp.muscadine.io",
      imageUrl: "https://miniapp.muscadine.io/image.png",
      splashImageUrl: "https://miniapp.muscadine.io/splash.png",
      splashBackgroundColor: "#000000",
      webhookUrl: "https://miniapp.muscadine.io/api/webhook",
      subtitle: "Earn",
      primaryCategory: "finance",
      description: "Earn through our Morpho vaults"
    },
    miniapp: {
      version: minikitConfig.miniapp.version,
      name: minikitConfig.miniapp.name,
      homeUrl: baseUrl,
      iconUrl: `${baseUrl}/icon.png`,
      splashImageUrl: `${baseUrl}/splash.png`,
      splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
      webhookUrl: `${baseUrl}/api/webhook`,
      subtitle: minikitConfig.miniapp.subtitle,
      description: minikitConfig.miniapp.description,
      screenshotUrls: [
        `${baseUrl}/screenshot.png`,
        `${baseUrl}/screenshot2.png`,
        `${baseUrl}/screenshot3.png`
      ],
      primaryCategory: minikitConfig.miniapp.primaryCategory,
      tags: ["defi", "lending", "yield", "base", "earn"],
      heroImageUrl: `${baseUrl}/hero.png`,
      tagline: minikitConfig.miniapp.tagline,
      ogTitle: minikitConfig.miniapp.ogTitle,
      ogDescription: minikitConfig.miniapp.ogDescription,
      ogImageUrl: `${baseUrl}/hero.png`
    }
  };

  return Response.json(manifest);
}
