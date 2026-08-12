import Image from "next/image";

type LogoIconProps = {
  className?: string;
  size?: number;
};

export default function LogoIcon({ className = "site-logo", size = 44 }: LogoIconProps) {
  return (
    <Image
      src="/logo.png"
      alt="Glansig Biltvätt – biltvätt och bilrekond"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
