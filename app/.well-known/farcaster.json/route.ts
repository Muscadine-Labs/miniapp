import { minikitConfig } from "../../../minikit.config";

/**
 * Manifest endpoint for Base MiniApp
 * @see https://docs.base.org/mini-apps/quickstart/migrate-existing-apps
 * 
 * The manifest must include three sections:
 * - accountAssociation: Domain ownership verification
 * - baseBuilder: Base Build account connection
 * - frame: MiniApp metadata and configuration
 */
export async function GET() {
  // All URLs must use miniapp.muscadine.io
  const baseUrl = "https://miniapp.muscadine.io";

  const config = {
    accountAssociation: {
      header: "eyJmaWQiOjIwNjQzNywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDUzNTBFMjQ5M0ZFZmEwRGJlRTY0ZTliYWM3MGVGNTUzNjk1MWRkMjQifQ",
      payload: "eyJkb21haW4iOiJtaW5pYXBwLm11c2NhZGluZS5pbyJ9",
      signature: "cEUOad3+hgxaE+gdNcxM7q2i9DIuQd49UZ4Qtm8iXcEueprpXWL0RM41BW1umWjtEk8Inlr0XvoX2RqNm2tLRhw="
    },
    frame: {
      version: "1",
      name: minikitConfig.miniapp.name,
      iconUrl: minikitConfig.miniapp.iconUrl,
      homeUrl: minikitConfig.miniapp.homeUrl,
      imageUrl: minikitConfig.miniapp.ogImageUrl, // 1200x630px PNG for rich embeds
      splashImageUrl: minikitConfig.miniapp.splashImageUrl,
      splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
      description: minikitConfig.miniapp.description,
      ogTitle: minikitConfig.miniapp.ogTitle,
      ogDescription: minikitConfig.miniapp.ogDescription,
      ogImageUrl: minikitConfig.miniapp.ogImageUrl,
      requiredCapabilities: [
        "actions.ready",
        "actions.openMiniApp",
        "actions.openUrl",
        "wallet.getEthereumProvider"
      ],
      requiredChains: [
        "eip155:8453" // Base network
      ],
      canonicalDomain: baseUrl,
      noindex: false,
      tags: minikitConfig.miniapp.tags,
      primaryCategory: minikitConfig.miniapp.primaryCategory
    },
    baseBuilder: {
      allowedAddresses: [minikitConfig.baseBuilder.ownerAddress],
      allowedDomains: ["miniapp.muscadine.io", "*.muscadine.io"]
    }
  };

  return Response.json(config, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
