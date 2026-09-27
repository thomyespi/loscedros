import Image from "next/image";
import { avatarGradient, initials } from "@/lib/avatar";
import { avatarUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: "size-6 text-[0.55rem]",
  sm: "size-8 text-[0.65rem]",
  md: "size-10 text-xs",
  lg: "size-14 text-base",
  xl: "size-20 text-xl",
  "2xl": "size-28 text-3xl",
} as const;

const PX = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80, "2xl": 112 } as const;

export function TeamAvatar({
  team,
  size = "md",
  className,
  ring = false,
}: {
  team: { name: string; avatarPath: string | null };
  size?: keyof typeof SIZES;
  className?: string;
  ring?: boolean;
}) {
  const url = avatarUrl(team.avatarPath);
  const base = cn(
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white select-none",
    ring && "ring-2 ring-white/15 ring-offset-2 ring-offset-background",
    SIZES[size],
    className,
  );

  if (url) {
    return (
      <span className={base}>
        <Image src={url} alt="" fill sizes={`${PX[size] * 2}px`} className="object-cover" />
      </span>
    );
  }

  return (
    <span className={base} style={{ backgroundImage: avatarGradient(team.name) }} aria-hidden>
      <span className="tracking-wide drop-shadow-sm">{initials(team.name)}</span>
    </span>
  );
}
