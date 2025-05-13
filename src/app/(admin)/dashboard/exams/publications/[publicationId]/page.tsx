import { Metadata } from "next";
import BreadcrumbsHolder from "@/components/breadcrumbs-holder/breadcrumbs-holder";
import PublicationViewer from "@/components/publications/publication-viewer";

export const metadata: Metadata = {
  title: "Exam Results Publication",
  description: "View and analyze exam result publications",
};

interface PublicationViewerPageProps {
  params: Promise<{ publicationId: string }>;
}

export default async function PublicationViewerPage({
  params,
}: PublicationViewerPageProps) {
  const { publicationId } = await params;

  return (
    <div className="w-full h-full relative overflow-y-auto pb-10">
      <BreadcrumbsHolder />
      <PublicationViewer publicationId={publicationId} />
    </div>
  );
}
