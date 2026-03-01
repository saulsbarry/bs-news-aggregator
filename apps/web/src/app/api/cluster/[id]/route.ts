import { NextResponse } from "next/server";
import { getClusterById } from "../../../../lib/cluster";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cluster = await getClusterById(id);
  if (!cluster) {
    return NextResponse.json({ error: "Cluster not found" }, { status: 404 });
  }
  return NextResponse.json(cluster);
}
