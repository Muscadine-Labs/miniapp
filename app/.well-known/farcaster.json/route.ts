export async function GET() {
  // Ensure URL always has https:// protocol
  let baseUrl = process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL || "https://miniapp.muscadine.io";
  
  // If VERCEL_URL is set, it doesn't include protocol, so add it
  if (baseUrl && !baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }
  
  const manifest = {
    version: "1",
    name: "Muscadine Earn",
    subtitle: "DeFi Lending Platform",
    description: "Earn interest on your crypto",
    screenshotUrls: [`${baseUrl}/screenshot.png`],
    iconUrl: `${baseUrl}/icon.png`,
    splashImageUrl: `${baseUrl}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: baseUrl,
    webhookUrl: `${baseUrl}/api/webhook`,
    primaryCategory: "finance",
    tags: ["defi", "lending", "morpho", "base"],
    heroImageUrl: `${baseUrl}/hero.png`,
    tagline: "Lend and earn with confidence",
    ogTitle: "Muscadine DeFi Lending",
    ogDescription: "Earn interest on your crypto",
    ogImageUrl: `${baseUrl}/hero.png`,
    framelink: baseUrl,
    accountAssociation: {
      type: "fid",
      fid: "536123456789"
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
      ownerAddress: "0x31E70f063cA802DedCd76e74C8F6D730eC43D9f0",
      allowedDomains: [baseUrl.replace("https://", ""), "*.muscadine.io"]
    }
  };

  return Response.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

