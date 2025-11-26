// All URLs must use miniapp.muscadine.io
const ROOT_URL = process.env.NEXT_PUBLIC_URL || "https://miniapp.muscadine.io";

/**
 * MiniApp configuration object. Must follow the Base MiniApp specification.
 *
 * @see {@link https://docs.base.org/mini-apps/quickstart/create-new-miniapp}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjIwNjQzNywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDUzNTBFMjQ5M0ZFZmEwRGJlRTY0ZTliYWM3MGVGNTUzNjk1MWRkMjQifQ",
    payload: "eyJkb21haW4iOiJtaW5pYXBwLm11c2NhZGluZS5pbyJ9",
    signature: "cEUOad3+hgxaE+gdNcxM7q2i9DIuQd49UZ4Qtm8iXcEueprpXWL0RM41BW1umWjtEk8Inlr0XvoX2RqNm2tLRhw="
  },
  miniapp: {
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
    tags: ["defi", "lending", "yield", "base", "earn"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Lend and earn with confidence",
    ogTitle: "Muscadine DeFi Lending",
    ogDescription: "Earn interest on your crypto",
    ogImageUrl: `${ROOT_URL}/og-image.png`, // Must be 1200x630px PNG (1.91:1 aspect ratio)
  },
  frame: {
    version: "1",
    name: "Muscadine Earn",
    iconUrl: `${ROOT_URL}/icon.png`,
    homeUrl: ROOT_URL,
    imageUrl: `${ROOT_URL}/og-image.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    description: "Earn interest on your crypto",
    ogTitle: "Muscadine DeFi Lending",
    ogDescription: "Earn interest on your crypto",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
    requiredCapabilities: [
      "actions.ready",
      "actions.openMiniApp",
      "actions.openUrl",
      "wallet.getEthereumProvider"
    ],
    requiredChains: ["eip155:8453"],
    canonicalDomain: ROOT_URL,
    noindex: false,
    tags: ["defi", "lending", "yield", "base", "earn"],
    primaryCategory: "finance"
  },
  baseBuilder: {
    ownerAddress: "0x31E70f063cA802DedCd76e74C8F6D730eC43D9f0",
    allowedAddresses: ["0x31E70f063cA802DedCd76e74C8F6D730eC43D9f0"]
  },
} as const;
