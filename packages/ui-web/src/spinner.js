import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const Spinner = ({
  inline = false,
  size,
  color,
  strokeWidth = 6,
  className,
  style,
  ...props
}) => (
  <svg
    data-inline={inline || undefined}
    viewBox="0 0 50 50"
    className={twMerge(
      clsx(
        "h-auto w-[var(--size,2rem)] text-[var(--color,currentColor)] animate-spinner-rotate",
        inline && "inline-block w-[0.85em]",
      ),
      className,
    )}
    style={{ "--size": size, "--color": color, ...style }}
    {...props}
  >
    <circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={strokeWidth}
      className="animate-spinner-dash"
    />
  </svg>
);

export default Spinner;
