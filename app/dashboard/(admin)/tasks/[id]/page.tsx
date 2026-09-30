import TaskDetailsClient from "./TaskDetailsClient";
import { initialTasks } from "@/lib/tasksData";

export function generateStaticParams() {
  return initialTasks.map((t) => ({ id: t.id }));
}

export default async function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  return <TaskDetailsClient id={resolved.id} />;
}
