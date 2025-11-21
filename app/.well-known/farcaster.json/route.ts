export async function GET() {
  // Ensure URL always has https:// protocol
  let baseUrl = process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL || "https://miniapp.muscadine.io";
  
  // If VERCEL_URL is set, it doesn't include protocol, so add it
  if (baseUrl && !baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }
  
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
      version: "1",
      name: "Muscadine Earn",
      homeUrl: baseUrl,
      iconUrl: `${baseUrl}/icon.png`,
      splashImageUrl: `${baseUrl}/splash.png`,
      splashBackgroundColor: "#000000",
      subtitle: "DeFi Lending Platform",
      description: "Earn interest on your crypto",
      screenshotUrls: [`${baseUrl}/screenshot.png`],
      primaryCategory: "finance",
      tags: ["defi", "lending", "morpho", "base"],
      heroImageUrl: `${baseUrl}/hero.png`,
      tagline: "Lend and earn with confidence",
      ogTitle: "Muscadine DeFi Lending",
      ogDescription: "Earn interest on your crypto",
      ogImageUrl: `${baseUrl}/hero.png`,
      noindex: true
    }
  };

  return Response.json(manifest);
}

