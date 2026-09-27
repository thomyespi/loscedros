import type { ReactNode } from "react";
import { WhatsAppIcon } from "@/components/brand/icons";
import { cn } from "@/lib/utils";
import { whatsappUrl, type WhatsAppContext } from "@/lib/whatsapp";

const VARIANTS = {
  primary:
    "bg-grass text-night hover:bg-grass-soft shadow-[0_10px_30px_-10px_rgb(155_226_45/0.6)]",
  whatsapp: "bg-whatsapp text-night hover:brightness-110 shadow-[0_10px_30px_-10px_rgb(37_211_102/0.55)]",
  outline: "border border-white/20 bg-white/5 text-chalk hover:bg-white/10 backdrop-blur",
  ghost: "text-chalk hover:bg-white/5",
} as const;

export function WhatsAppButton({
  phone,
  context,
  children,
  variant = "whatsapp",
  size = "lg",
  className,
  icon = true,
}: {
  phone: string;
  context: WhatsAppContext;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  size?: "md" | "lg";
  className?: string;
  icon?: boolean;
}) {
  return (
    <a
      href={whatsappUrl(phone, context)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-grass/50 focus-visible:outline-none",
        size === "lg" ? "h-13 px-6 text-base" : "h-11 px-5 text-sm",
        VARIANTS[variant],
        className,
      )}
    >
      {icon && <WhatsAppIcon className={size === "lg" ? "size-5" : "size-4"} />}
      {children}
    </a>
  );
}
