import { NextResponse } from "next/server";
import { minikitConfig } from "../../../minikit.config";

export async function GET() {
  // Build manifest according to Base documentation
  // https://docs.base.org/mini-apps/core-concepts/manifest
  const manifest: {
    accountAssociation: {
      header: string;
      payload: string;
      signature: string;
    };
    baseBuilder: {
      ownerAddress: string;
    };
    miniapp: {
      version: string;
      name: string;
      homeUrl: string;
      iconUrl: string;
      splashImageUrl: string;
      splashBackgroundColor: string;
      subtitle: string;
      description: string;
      screenshotUrls: string[];
      primaryCategory: string;
      tags: string[];
      heroImageUrl: string;
      tagline: string;
      ogTitle: string;
      ogDescription: string;
      ogImageUrl: string;
      noindex?: boolean;
      webhookUrl?: string;
    };
  } = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: ""
    },
    baseBuilder: {
      ownerAddress: minikitConfig.baseBuilder.ownerAddress
    },
    miniapp: {
      version: minikitConfig.frame.version,
      name: minikitConfig.frame.name,
      homeUrl: minikitConfig.frame.homeUrl,
      iconUrl: minikitConfig.frame.iconUrl,
      splashImageUrl: minikitConfig.frame.splashImageUrl,
      splashBackgroundColor: minikitConfig.frame.splashBackgroundColor,
      subtitle: minikitConfig.frame.subtitle,
      description: minikitConfig.frame.description,
      screenshotUrls: [...minikitConfig.frame.screenshotUrls],
      primaryCategory: minikitConfig.frame.primaryCategory,
      tags: [...minikitConfig.frame.tags],
      heroImageUrl: minikitConfig.frame.heroImageUrl,
      tagline: minikitConfig.frame.tagline,
      ogTitle: minikitConfig.frame.ogTitle,
      ogDescription: minikitConfig.frame.ogDescription,
      ogImageUrl: minikitConfig.frame.ogImageUrl,
      noindex: true
    }
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

