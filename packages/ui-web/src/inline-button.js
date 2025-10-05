import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const InlineButton = React.forwardRef(
  ({ variant = "button", component = "button", disabled, ...props }, ref) => {
    const additionalProps = !disabled
      ? {}
      : component === "button"
        ? { disabled: true }
        : { "data-disabled": true, "aria-disabled": true };

    const mergedProps = {
      component,
      ...props,
      ...additionalProps,
    };

    if (variant === "link") return <InlineLink ref={ref} {...mergedProps} />;

    return <InlineActionButton ref={ref} {...mergedProps} />;
  },
);

const InlineLink = React.forwardRef(
  ({ component: Component = "button", className, ...props }, ref) => (
    <Component
      ref={ref}
      className={twMerge(
        clsx(
          "inline text-inherit leading-[inherit] font-semibold no-underline outline-hidden transition-colors duration-100 ease-linear",
          "focus-visible:underline hover:underline",
          "disabled:pointer-events-none disabled:text-text-dimmed",
          "[&[data-disabled]]:pointer-events-none [&[data-disabled]]:text-text-dimmed",
          className,
        ),
      )}
      {...props}
    />
  ),
);

const InlineActionButton = React.forwardRef(
  ({ component: Component = "button", className, ...props }, ref) => (
    <Component
      ref={ref}
      className={twMerge(
        clsx(
          "inline-block rounded-[0.3rem] border border-transparent px-(0.2rem) py-0 font-semibold leading-[inherit] text-(--color-mention-text)",
          "bg-(--color-mention-background) outline-hidden transition-colors duration-100 ease-linear",
          "hover:text-(--color-mention-text-hover) hover:bg-(--color-mention-background-hover)",
          "focus-visible:relative focus-visible:z-10 focus-visible:[box-shadow:0_0_0_0.2rem_var(--color-mention-focus-border)]",
          "disabled:pointer-events-none disabled:text-text-dimmed disabled:bg-(--color-surface-muted)",
          "[&[data-disabled]]:pointer-events-none [&[data-disabled]]:text-text-dimmed [&[data-disabled]]:bg-(--color-surface-muted)",
          "[&[data-focused]]:relative [&[data-focused]]:z-10 [&[data-focused]]:[box-shadow:0_0_0_0.2rem_var(--color-mention-focus-border)]",
          className,
        ),
      )}
      {...props}
    />
  ),
);

InlineButton.displayName = "InlineButton";
InlineLink.displayName = "InlineButton.Link";
InlineActionButton.displayName = "InlineButton.Button";

export default InlineButton;
