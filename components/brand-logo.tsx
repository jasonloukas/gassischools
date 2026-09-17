import Image from "next/image";

export function BrandLogo({
  height = 48,
}: {
  height?: number;
}) {
  const width = Math.round((380 / 238) * height);
  return (
    <Image
      src="/logo.png"
      alt="GASSI Holidays"
      width={width}
      height={height}
      priority
    />
  );
}
