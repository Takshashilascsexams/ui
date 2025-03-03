import { auth, clerkClient } from "@clerk/nextjs/server";
import Main from "./main";

export default async function Dashboard() {
  const { userId } = await auth();

  const currentUser = userId
    ? await (await clerkClient()).users.getUser(userId)
    : null;

  const userData = {
    role: currentUser?.publicMetadata?.role as string,
    fullName: currentUser?.publicMetadata?.fullName as string,
  };

  return (
    <div>
      <Main userData={userData} />
    </div>
  );
}
