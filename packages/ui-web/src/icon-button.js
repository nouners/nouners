import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { heightBySize } from "./button.js";

const sizeClassByKey = {
  default: "size-16",
  tiny: "size-10",
  small: "size-14",
  medium: "size-18",
};

const defaultPropsByComponent = {
  button: {
    type: "button",
  },
};

const IconButton = React.forwardRef(
  (
    {
      component: Component = "button",
      size = "2.6rem",
      dimmed = false,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const presetClass = sizeClassByKey[size];
    const fallbackSize = heightBySize[size] ?? size;

    return (
      <Component
        ref={ref}
        {...defaultPropsByComponent[Component]}
        {...props}
        className={twMerge(
          clsx(
            "inline-flex items-center justify-center rounded-sm text-current transition-colors duration-100 ease-linear",
            "focus-visible:[box-shadow:0_0_0_0.2rem_var(--color-accent-primary)] focus-visible:outline-hidden",
            "hover:bg-(--color-surface-muted)",
            "disabled:pointer-events-none disabled:text-text-muted",
            dimmed ? "text-text-dimmed" : "text-text-normal",
            presetClass,
            className,
          ),
        )}
        style={{
          ...style,
          ...(presetClass
            ? null
            : { width: fallbackSize, height: fallbackSize }),
        }}
      />
    );
  },
);

IconButton.displayName = "IconButton";

export default IconButton;
