import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const Link = ({
  underline = false,
  variant = "regular",
  component: Component = "button",
  size,
  className,
  ...props
}) => {
  const variantClasses =
    variant === "dimmed"
      ? "text-text-dimmed hover:text-(--color-text-dimmed-hover)"
      : "text-text-primary hover:text-accent-hover";

  const sizeClass = size === "small" ? "text-sm" : undefined;

  return (
    <Component
      data-size={size}
      data-variant={variant}
      data-underline={underline || undefined}
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1 text-current no-underline outline-hidden transition-colors duration-100 ease-linear",
          "focus-visible:underline hover:underline",
          variantClasses,
          sizeClass,
          underline && "underline",
          className,
        ),
      )}
      {...props}
    />
  );
};

export default Link;
