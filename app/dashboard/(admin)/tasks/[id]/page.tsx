import TaskDetailsClient from "./TaskDetailsClient";
import { initialTasks } from "@/lib/tasksData";

export function generateStaticParams() {
  const ids = new Set<string>();
  initialTasks.forEach((t) => ids.add(t.id));
  // Include pre-allocated IDs for newly created or assigned tasks
  for (let i = 1001; i <= 1050; i++) {
    ids.add(`T-${i}`);
  }
  return Array.from(ids).map((id) => ({ id }));
}

export default async function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  return <TaskDetailsClient id={resolved.id} />;
}
