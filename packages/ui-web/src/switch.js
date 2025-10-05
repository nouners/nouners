import clsx from "clsx";
import { Switch as ReactAriaSwitch } from "react-aria-components";
import { twMerge } from "tailwind-merge";

const Switch = ({ label, size, align, variant, className, ...props }) => (
  <ReactAriaSwitch
    {...props}
    data-size={size}
    data-align={align}
    data-variant={variant}
    className={twMerge(
      clsx(
        "group/switch inline-flex items-center gap-3 text-text-normal text-base cursor-pointer",
        "data-[size=small]:text-sm",
        "data-[align=right]:flex-row-reverse",
        "disabled:cursor-not-allowed disabled:text-text-muted",
        "data-[disabled]:cursor-not-allowed data-[disabled]:text-text-muted",
      ),
      className,
    )}
  >
    <span
      className={clsx(
        "indicator relative inline-flex h-[1.8rem] w-[3rem] items-center rounded-full border-[0.2rem] border-transparent",
        "bg-(--color-surface-contrast) transition-colors duration-150 ease-out",
        "group-data-[variant=light]/switch:bg-(--color-surface-strong)",
        "group-data-[selected]/switch:bg-accent-primary",
        "group-data-[focus-visible]/switch:focus-ring",
        "group-data-[disabled]/switch:bg-(--color-surface-muted)",
        "disabled:bg-(--color-surface-muted)",
      )}
    >
      <span
        className={clsx(
          "pointer-events-none block h-[1.4rem] w-[1.4rem] rounded-full bg-white transition-transform duration-200 ease-out",
          "translate-x-0 group-data-[selected]/switch:translate-x-[calc(100%-0.2rem)]",
        )}
      />
    </span>
    {label}
  </ReactAriaSwitch>
);

export default Switch;
