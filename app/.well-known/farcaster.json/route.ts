export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL || "https://miniapp.muscadine.io";
  
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
      homeUrl: URL,
      iconUrl: `${URL}/icon.png`,
      splashImageUrl: `${URL}/splash.png`,
      splashBackgroundColor: "#000000",
      subtitle: "DeFi Lending Platform",
      description: "Earn interest on your crypto",
      screenshotUrls: [`${URL}/screenshot.png`],
      primaryCategory: "finance",
      tags: ["defi", "lending", "morpho", "base"],
      heroImageUrl: `${URL}/hero.png`,
      tagline: "Lend and earn with confidence",
      ogTitle: "Muscadine DeFi Lending",
      ogDescription: "Earn interest on your crypto",
      ogImageUrl: `${URL}/hero.png`,
      noindex: true
    }
  };

  return Response.json(manifest);
}

