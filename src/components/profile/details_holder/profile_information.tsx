import { DetailsHolderPropType } from "./details_holder";
import { convertToRedeableDate } from "@/lib/convertToReadableDate";

export default function ProfileInfoHolder(props: DetailsHolderPropType) {
  const { fullName, email, phoneNumber, dateOfBirth, joined } = props;

  return (
    <div className="w-full flex flex-col items-start justify-center gap-4">
      <span>
        <h1 className="text-base font-medium">Profile Information</h1>
      </span>
      <span>
        <p className="text-sm">Name: {fullName}</p>
      </span>
      <span>
        <p className="text-sm">Email: {email}</p>
      </span>
      <span>
        <p className="text-sm">Phone: {phoneNumber.slice(3)}</p>
      </span>
      <span>
        <p className="text-sm">
          Date of Birth: {convertToRedeableDate(dateOfBirth)}
        </p>
      </span>
      <span>
        <p className="text-sm">Joined: {convertToRedeableDate(joined)}</p>
      </span>
    </div>
  );
}
