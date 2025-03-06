import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import Link from "next/link";

type AvatarHolderPropType = {
  imageUrl: string;
  fullName: string;
  role: string;
};

export default function AvatarHolder({
  imageUrl,
  fullName,
  role,
}: AvatarHolderPropType) {
  return (
    <div className="w-full lg:w-[40%] flex lg:flex-col items-center justify-center gap-5">
      <div className="w-[70px] h-[70px] lg:w-[100px] lg:h-[100px] border-[2px] border-slate-200 rounded-full">
        <Avatar className="w-[70px] h-[70px] lg:w-[100px] lg:h-[100px] rounded-full">
          <AvatarImage src={imageUrl} alt="avatar" className="rounded-full" />
          <AvatarFallback>{fullName.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 flex lg:flex-col items-start lg:items-center justify-center lg:gap-5">
        <div className="flex-1 flex flex-col items-start lg:items-center justify-center">
          <h1 className="text-lg font-medium">
            {fullName[0].toUpperCase() + fullName.slice(1)}
          </h1>
          <p className="text-sm">{role}</p>
        </div>

        {role === "Admin" && (
          <div>
            <Link
              href={"/dashboard"}
              className="px-4 py-2 bg-blue-600 text-sm text-white rounded-md"
            >
              Go to dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
