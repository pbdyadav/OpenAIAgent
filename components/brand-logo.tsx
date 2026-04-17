import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
};

export function BrandLogo({ className, imageClassName }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="AgentHub"
        width={220}
        height={72}
        className={cn("h-20 w-auto object-contain", imageClassName)}
        priority
      />
    </div>
  );
}
