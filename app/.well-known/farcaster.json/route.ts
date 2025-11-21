import { minikitConfig } from "../../../minikit.config";

export async function GET() {
  // Ensure URL always has https:// protocol
  let baseUrl = process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL || "https://miniapp.muscadine.io";
  
  // If VERCEL_URL is set, it doesn't include protocol, so add it
  if (baseUrl && !baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  // Base MiniApp manifest structure as per Base documentation
  // https://docs.base.org/mini-apps/quickstart/create-new-miniapp
  const manifest = {
    accountAssociation: minikitConfig.accountAssociation,
    miniapp: {
      ...minikitConfig.miniapp,
      // Ensure URLs use the current baseUrl
      screenshotUrls: [`${baseUrl}/screenshot.png`],
      iconUrl: `${baseUrl}/icon.png`,
      splashImageUrl: `${baseUrl}/splash.png`,
      heroImageUrl: `${baseUrl}/hero.png`,
      ogImageUrl: `${baseUrl}/hero.png`,
      homeUrl: baseUrl,
      webhookUrl: `${baseUrl}/api/webhook`,
    }
  };

  return Response.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

