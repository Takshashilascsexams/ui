import Image from "next/image";

type CustomImagePropType = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
};

export default function CustomImage({
  src,
  alt,
  sizes,
  className,
}: CustomImagePropType) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority
      sizes={sizes}
      style={{ objectFit: "contain" }}
      className={className}
    />
  );
}
