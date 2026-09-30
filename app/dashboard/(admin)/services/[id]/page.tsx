import EditServiceClient from "./EditServiceClient";
import { initialServices } from "@/lib/servicesData";

export function generateStaticParams() {
  return initialServices.map((s) => ({ id: s.id }));
}

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  return <EditServiceClient id={resolved.id} />;
}
