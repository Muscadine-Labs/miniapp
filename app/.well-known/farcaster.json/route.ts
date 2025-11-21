import { NextResponse } from "next/server";
import { minikitConfig } from "../../../minikit.config";

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: ""
    },
    baseBuilder: {
      ownerAddress: "0x31E70f063cA802DedCd76e74C8F6D730eC43D9f0"
    },
    miniapp: {
      version: minikitConfig.frame.version,
      name: minikitConfig.frame.name,
      homeUrl: minikitConfig.frame.homeUrl,
      iconUrl: minikitConfig.frame.iconUrl,
      splashImageUrl: minikitConfig.frame.splashImageUrl,
      splashBackgroundColor: minikitConfig.frame.splashBackgroundColor,
      webhookUrl: minikitConfig.frame.webhookUrl,
      subtitle: minikitConfig.frame.subtitle,
      description: minikitConfig.frame.description,
      screenshotUrls: minikitConfig.frame.screenshotUrls,
      primaryCategory: minikitConfig.frame.primaryCategory,
      tags: minikitConfig.frame.tags,
      heroImageUrl: minikitConfig.frame.heroImageUrl,
      tagline: minikitConfig.frame.tagline,
      ogTitle: minikitConfig.frame.ogTitle,
      ogDescription: minikitConfig.frame.ogDescription,
      ogImageUrl: minikitConfig.frame.ogImageUrl,
      noindex: true
    }
  };

  return NextResponse.json(manifest);
}

