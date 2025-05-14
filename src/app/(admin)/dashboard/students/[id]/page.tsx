import StudentsDetails from "@/components/dashboard/students/students-details";

export const dynamic = "force-dynamic";

interface UserDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailsPage({
  params,
}: UserDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="w-full h-full relative overflow-y-auto pb-10">
      <StudentsDetails userId={id} />
    </div>
  );
}
