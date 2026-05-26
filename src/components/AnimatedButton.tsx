import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type AnimatedButtonProps = HTMLMotionProps<"button"> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

const variants = {
  primary: "border-trauma/70 bg-trauma text-white shadow-alert hover:bg-[#ff4560]",
  secondary: "border-scrub/60 bg-scrub/12 text-scrub shadow-scrub hover:bg-scrub/20",
  danger: "border-amber/70 bg-amber/12 text-amber hover:bg-amber/20",
  ghost: "border-white/15 bg-white/5 text-white/85 hover:bg-white/10"
};

export function AnimatedButton({ children, className = "", variant = "primary", ...props }: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
