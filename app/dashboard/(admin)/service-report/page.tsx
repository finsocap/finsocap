import { redirect } from "next/navigation";

export default function ServiceReportPage() {
  redirect("/dashboard/reports?tab=service");
}
