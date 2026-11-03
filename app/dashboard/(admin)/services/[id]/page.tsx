import EditServiceClient from "./EditServiceClient";

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  return <EditServiceClient id={resolved.id} />;
}
