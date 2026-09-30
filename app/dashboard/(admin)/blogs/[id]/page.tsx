import EditBlogClient from "./EditBlogClient";

export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }];
}

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params;
  return <EditBlogClient id={resolved.id} />;
}
