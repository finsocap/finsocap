import ServiceEditorForm from "@/components/Dashboard/ServiceEditorForm";

export const metadata = {
  title: "Add New Service",
  description: "Create and publish a new business service to the catalog.",
};

export default function NewServicePage() {
  return <ServiceEditorForm isEditMode={false} />;
}
