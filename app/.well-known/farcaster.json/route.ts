export async function GET() {
  // All URLs must use miniapp.muscadine.io
  const baseUrl = "https://miniapp.muscadine.io";

  const config = {
    accountAssociation: {
      header: "eyJmaWQiOjIwNjQzNywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDUzNTBFMjQ5M0ZFZmEwRGJlRTY0ZTliYWM3MGVGNTUzNjk1MWRkMjQifQ",
      payload: "eyJkb21haW4iOiJtaW5pYXBwLm11c2NhZGluZS5pbyJ9",
      signature: "cEUOad3+hgxaE+gdNcxM7q2i9DIuQd49UZ4Qtm8iXcEueprpXWL0RM41BW1umWjtEk8Inlr0XvoX2RqNm2tLRhw="
    },
    frame: {
      version: "1",
      name: "Muscadine",
      iconUrl: `${baseUrl}/icon.png`,
      homeUrl: baseUrl,
      imageUrl: `${baseUrl}/og-image.png`, // 1200x630px PNG for rich embeds
      splashImageUrl: `${baseUrl}/splash.png`,
      splashBackgroundColor: "#000000",
      description: "Earn interest on your crypto",
      ogTitle: "Muscadine Lending",
      ogDescription: "Earn interest on your crypto",
      ogImageUrl: `${baseUrl}/og-image.png`, // 1200x630px PNG (1.91:1 aspect ratio)
      requiredCapabilities: [
        "actions.ready",
        "actions.openMiniApp",
        "actions.openUrl",
        "wallet.getEthereumProvider"
      ],
      requiredChains: [
        "eip155:8453" // Base network
      ],
      canonicalDomain: baseUrl,
      noindex: false,
      tags: ["defi", "lending", "yield", "base", "earn"],
      primaryCategory: "finance"
    },
    baseBuilder: {
      allowedAddresses: ["0x31E70f063cA802DedCd76e74C8F6D730eC43D9f0"]
    }
  };

  return Response.json(config);
}
