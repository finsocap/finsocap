import TaskDetailsClient from "./TaskDetailsClient";

export const dynamic = "force-dynamic";

export default async function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  return <TaskDetailsClient id={resolved.id} />;
}
