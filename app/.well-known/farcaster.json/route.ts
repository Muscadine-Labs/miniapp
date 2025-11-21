export async function GET() {
  const manifest = {
    baseBuilder: {
      ownerAddress: "0x31E70f063cA802DedCd76e74C8F6D730eC43D9f0"
    }
  };

  return Response.json(manifest);
}
