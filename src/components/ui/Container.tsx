import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "main";
  id?: string;
}

export function Container({
  children,
  className,
  as: Tag = "div",
  id,
}: ContainerProps) {
  return (
    <Tag id={id} className={cn("container-page", className)}>
      {children}
    </Tag>
  );
}
