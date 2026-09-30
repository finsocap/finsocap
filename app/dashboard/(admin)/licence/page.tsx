import { redirect } from "next/navigation";

export default function LicencePage() {
  redirect("/dashboard/reports?tab=licence");
}
