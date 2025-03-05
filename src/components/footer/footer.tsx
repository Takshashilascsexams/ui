import Link from "next/link";

export default function Footer() {
  return (
    <div className="w-full px-5 py-28 text-sm flex flex-col items-center justify-center gap-5">
      <div className="flex items-center justify-center gap-5">
        <Link href={"#"}>Facebook</Link>
        <Link href={"#"}>Twitter</Link>
        <Link href={"#"}>Instagram</Link>
        <Link href={"#"}>LinkedIn</Link>
      </div>

      <div>
        <span>
          <Link
            href={"https://takshashilascs.com/"}
            target="_blank"
            className="underline"
          >
            &copy; Takshashila School of Civil Services.
          </Link>{" "}
          All rights reserved.
        </span>
      </div>
    </div>
  );
}
