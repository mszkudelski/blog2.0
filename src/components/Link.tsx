
import { cn } from "@lib/utils";

type Props = React.PropsWithChildren<{
  href: string;
  external?: boolean;
  underline?: boolean;
  className?: string;
  variant?: "default" | "primary" | "secondary";
}>;


const variantStyles = {
  default: [
    "inline-block text-slate-600 dark:text-slate-300",
    "hover:text-slate-900 dark:hover:text-white",
    "decoration-slate-300 dark:decoration-slate-600",
    "hover:decoration-slate-400 dark:hover:decoration-slate-500",
  ],
  primary: [
    "text-indigo-600 dark:text-indigo-400",
    "hover:text-indigo-800 dark:hover:text-indigo-300",
    "decoration-indigo-300 dark:decoration-indigo-600",
    "hover:decoration-indigo-500 dark:hover:decoration-indigo-400",
  ],
  secondary: [
    "text-blue-600 dark:text-blue-400",
    "hover:text-blue-800 dark:hover:text-blue-300",
    "decoration-blue-300 dark:decoration-blue-600",
    "hover:decoration-blue-500 dark:hover:decoration-blue-400",
  ],
};


export const Link: React.FC<Props> = ({
  href,
  external,
  underline = true,
  className,
  variant = "default",
  children,
  ...rest
}) => (
  <a
    href={href}
    target={external ? "_blank" : "_self"}
    className={cn(
      "inline-block",
      variantStyles[variant],
      "transition-colors duration-300 ease-in-out",
      underline && "underline underline-offset-2",
      className,
    )}
    {...rest}
  >
    {children}
  </a>
)