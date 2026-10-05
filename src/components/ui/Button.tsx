import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground shadow-soft hover:brightness-105 hover:-translate-y-0.5",
  secondary:
    "bg-sand/70 text-foreground hover:bg-sand dark:bg-sand/40 dark:hover:bg-sand/55",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  outline:
    "border border-border bg-transparent text-foreground hover:border-accent hover:text-accent",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.95rem]",
  lg: "h-14 px-8 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-[1.25rem] font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonBaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonBaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const isInternal = href.startsWith("/") || href.startsWith("#");

  if (isInternal) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} {...props}>
      {children}
    </a>
  );
}
