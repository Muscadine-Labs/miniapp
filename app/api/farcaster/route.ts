import { NextResponse } from "next/server";
import { minikitConfig } from "../../../minikit.config";

export async function GET() {
  // Return the complete Farcaster manifest configuration with all required fields
  return NextResponse.json({
    version: "1",
    name: minikitConfig.frame.name,
    subtitle: minikitConfig.frame.subtitle,
    description: minikitConfig.frame.description,
    screenshotUrls: minikitConfig.frame.screenshotUrls,
    iconUrl: minikitConfig.frame.iconUrl,
    splashImageUrl: minikitConfig.frame.splashImageUrl,
    splashBackgroundColor: minikitConfig.frame.splashBackgroundColor,
    homeUrl: minikitConfig.frame.homeUrl,
    webhookUrl: minikitConfig.frame.webhookUrl,
    primaryCategory: minikitConfig.frame.primaryCategory,
    secondaryCategory: "defi",
    tags: minikitConfig.frame.tags,
    heroImageUrl: minikitConfig.frame.heroImageUrl,
    tagline: minikitConfig.frame.tagline,
    ogTitle: minikitConfig.frame.ogTitle,
    ogDescription: minikitConfig.frame.ogDescription,
    ogImageUrl: minikitConfig.frame.ogImageUrl,
    framelink: minikitConfig.frame.homeUrl,
    accountAssociation: {
      type: "fid",
      fid: "536123456789"
    },
    frame: {
      version: minikitConfig.frame.version,
      name: minikitConfig.frame.name,
      subtitle: minikitConfig.frame.subtitle,
      description: minikitConfig.frame.description,
      iconUrl: minikitConfig.frame.iconUrl,
      homeUrl: minikitConfig.frame.homeUrl,
      imageUrl: minikitConfig.frame.heroImageUrl,
      buttonTitle: `Launch ${minikitConfig.frame.name}`,
      splashImageUrl: minikitConfig.frame.splashImageUrl,
      splashBackgroundColor: minikitConfig.frame.splashBackgroundColor,
      webhookUrl: minikitConfig.frame.webhookUrl,
      primaryCategory: minikitConfig.frame.primaryCategory,
      tags: minikitConfig.frame.tags,
      tagline: minikitConfig.frame.tagline,
      ogTitle: minikitConfig.frame.ogTitle,
      ogDescription: minikitConfig.frame.ogDescription,
      ogImageUrl: minikitConfig.frame.ogImageUrl,
    },
    miniapp: {
      version: "1.0.0",
      platform: "web",
      supportedChains: ["base"],
      features: ["wallet", "defi", "lending", "swapping"],
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
    baseBuilder: {
      ...minikitConfig.baseBuilder,
      allowedDomains: ["miniapp.muscadine.io", "*.muscadine.io"]
    },
    creator: {
      name: "Muscadine Team",
      url: "https://miniapp.muscadine.io"
    },
    license: "MIT",
    policy: {
      privacy: "https://miniapp.muscadine.io/privacy",
      terms: "https://miniapp.muscadine.io/terms"
    }
  }, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
