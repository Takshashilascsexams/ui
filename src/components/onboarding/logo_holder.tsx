import Image from "next/image";

export default function LogoHolder() {
  return (
    <div className="w-[140px] h-[140px] lg:w-[160px] lg:h-[160px] relative">
      <Image
        src={"/images/logo.webp"}
        alt="logo"
        fill
        priority
        sizes="(max-width: 768px) 140px, (min-width: 769px) 160px"
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}
