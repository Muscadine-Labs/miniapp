const ROOT_URL = process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL || "https://miniapp.muscadine.io";

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  frame: {
    version: "1",
    name: "Muscadine Earn",
    subtitle: "DeFi Lending Platform",
    description: "Earn interest on your crypto",
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "finance",
    tags: ["defi", "lending", "morpho", "base"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Lend and earn with confidence",
    ogTitle: "Muscadine DeFi Lending",
    ogDescription: "Earn interest on your crypto",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
  baseBuilder: {
    ownerAddress: "0x31E70f063cA802DedCd76e74C8F6D730eC43D9f0"
  },
} as const;
