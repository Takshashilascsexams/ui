import Link from "next/link";

export default function Footer() {
  return (
    <div className="w-full px-5 py-28 text-sm flex flex-col items-center justify-center gap-5">
      <div className="flex items-center justify-center gap-5">
        <Link href={"https://www.facebook.com/takshashilascs"} target="_blank">
          Facebook
        </Link>
        <Link href={"https://x.com/takshashilascs"} target="_blank">
          Twitter
        </Link>
        <Link
          href={"https://www.instagram.com/takshashilascs/?hl=en"}
          target="_blank"
        >
          Instagram
        </Link>
        <Link href={"#"}>LinkedIn</Link>
      </div>

      <div className="text-center">
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
