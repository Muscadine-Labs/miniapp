import { minikitConfig } from "../../../minikit.config";

export async function GET() {
  // Return the complete manifest as required by Base MiniApp specification
  // This includes accountAssociation, miniapp, and baseBuilder sections
  const manifest = {
    accountAssociation: minikitConfig.accountAssociation,
    miniapp: minikitConfig.miniapp,
    baseBuilder: minikitConfig.baseBuilder,
  };

  return Response.json(manifest);
}
