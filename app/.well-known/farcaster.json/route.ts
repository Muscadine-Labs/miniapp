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
  // Always use production domain for manifest URLs
  // This is the canonical manifest endpoint per Base MiniApp specification
  // Served locally as required by Base Featured Guidelines
  // All URLs must use miniapp.muscadine.io
  const baseUrl = "https://miniapp.muscadine.io";

  const manifest = {
    version: "1",
    name: minikitConfig.miniapp.name,
    subtitle: minikitConfig.miniapp.subtitle,
    description: minikitConfig.miniapp.description,
    screenshotUrls: minikitConfig.miniapp.screenshotUrls,
    iconUrl: minikitConfig.miniapp.iconUrl,
    splashImageUrl: minikitConfig.miniapp.splashImageUrl,
    splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
    homeUrl: minikitConfig.miniapp.homeUrl,
    webhookUrl: minikitConfig.miniapp.webhookUrl,
    primaryCategory: minikitConfig.miniapp.primaryCategory,
    secondaryCategory: "finance",
    tags: minikitConfig.miniapp.tags,
    heroImageUrl: minikitConfig.miniapp.heroImageUrl,
    tagline: minikitConfig.miniapp.tagline,
    ogTitle: minikitConfig.miniapp.ogTitle,
    ogDescription: minikitConfig.miniapp.ogDescription,
    ogImageUrl: minikitConfig.miniapp.ogImageUrl,
    noindex: false,
    framelink: minikitConfig.miniapp.homeUrl,
    accountAssociation: {
      header: "eyJmaWQiOjIwNjQzNywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDUzNTBFMjQ5M0ZFZmEwRGJlRTY0ZTliYWM3MGVGNTUzNjk1MWRkMjQifQ",
      payload: "eyJkb21haW4iOiJtaW5pYXBwLm11c2NhZGluZS5pbyJ9",
      signature: "cEUOad3+hgxaE+gdNcxM7q2i9DIuQd49UZ4Qtm8iXcEueprpXWL0RM41BW1umWjtEk8Inlr0XvoX2RqNm2tLRhw="
    },
    baseBuilder: {
      ownerAddress: minikitConfig.baseBuilder.ownerAddress,
      allowedDomains: ["miniapp.muscadine.io", "*.muscadine.io"]
    },
    frame: {
      version: "1",
      name: minikitConfig.miniapp.name,
      subtitle: minikitConfig.miniapp.subtitle,
      description: minikitConfig.miniapp.description,
      iconUrl: minikitConfig.miniapp.iconUrl,
      homeUrl: minikitConfig.miniapp.homeUrl,
      imageUrl: minikitConfig.miniapp.ogImageUrl, // 1200x630px PNG for rich embeds
      buttonTitle: `Launch ${minikitConfig.miniapp.name}`,
      splashImageUrl: minikitConfig.miniapp.splashImageUrl,
      splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
      webhookUrl: minikitConfig.miniapp.webhookUrl,
      primaryCategory: minikitConfig.miniapp.primaryCategory,
      tags: minikitConfig.miniapp.tags,
      tagline: minikitConfig.miniapp.tagline,
      ogTitle: minikitConfig.miniapp.ogTitle,
      ogDescription: minikitConfig.miniapp.ogDescription,
      ogImageUrl: minikitConfig.miniapp.ogImageUrl
    },
    miniapp: {
      version: minikitConfig.miniapp.version,
      platform: "web",
      supportedChains: ["base"],
      features: ["wallet", "defi", "lending"],
      permissions: ["wallet_access", "transaction_signing"],
      capabilities: {
        wallet: true,
        transactions: true,
        defi: true,
        contract_interaction: true,
        asset_storage: true
      },
      apis: {
        blockchain: "base",
        connect: ["wallet", "web3"],
        transaction: ["send", "sign", "delegate"]
      },
      security: {
        sandbox: true,
        permissions: ["cross_origin"]
      }
    },
    creator: {
      name: "Muscadine Team",
      url: baseUrl
    },
    license: "MIT",
    policy: {
      privacy: `${baseUrl}/privacy`,
      terms: `${baseUrl}/terms`
    }
  };

  return Response.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
