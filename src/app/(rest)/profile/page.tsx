import { auth, clerkClient } from "@clerk/nextjs/server";
import AvatarHolder from "@/components/profile/avatar_holder";
import DetailsHolder from "@/components/profile/details_holder/details_holder";

export default async function Dashboard() {
  const { userId } = await auth();

  const currentUser = await (
    await clerkClient()
  ).users.getUser(userId as string);

  // console.log(currentUser);

  return (
    <div className="w-full h-full px-7 lg:px-44 py-10 flex flex-col lg:flex-row items-start justify-center gap-8 border-t-[1px] border-slate-200">
      <AvatarHolder
        imageUrl={currentUser.imageUrl}
        fullName={currentUser.publicMetadata.fullName as string}
        role={currentUser.publicMetadata.role as string}
      />
      <DetailsHolder
        fullName={currentUser.publicMetadata.fullName as string}
        email={currentUser.emailAddresses[0].emailAddress}
        phoneNumber={currentUser.phoneNumbers[0].phoneNumber}
        joined={currentUser.createdAt}
        dateOfBirth={currentUser.publicMetadata.dateOfBirth as string}
      />
    </div>
  );
}
