import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import * as Tooltip from "@radix-ui/react-tooltip";

export const Provider = Tooltip.Provider;

export const Root = Tooltip.Root;

export const Trigger = Tooltip.Trigger;

export const Content = React.forwardRef(
  ({ portal = true, className, ...props }, ref) => {
    const content = (
      <Tooltip.Content
        ref={ref}
        collisionPadding={10}
        className={twMerge(
          clsx(
            "z-[10] rounded-[0.3rem] bg-(--color-surface-tooltip) px-(0.8rem) py-(0.4rem)",
            "text-text-normal text-sm font-normal leading-[1.35] text-left shadow-elevation-high",
            "[&_p+p]:mt-[0.5em]",
            className,
          ),
        )}
        {...props}
      />
    );

    if (!portal) return content;

    return <Tooltip.Portal>{content}</Tooltip.Portal>;
  },
);

Content.displayName = "Tooltip.Content";
