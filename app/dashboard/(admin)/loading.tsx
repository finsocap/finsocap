import FinsocapLoader from "@/components/Global/FinsocapLoader";

export default function DashboardLoading() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
      <FinsocapLoader label="Loading..." size="md" />
    </div>
  );
}
