import React from "react";
import * as Toolbar from "@radix-ui/react-toolbar";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export const Root = React.forwardRef(({ className, ...props }, ref) => (
  <Toolbar.Root
    ref={ref}
    className={twMerge(
      clsx(
        "flex min-w-max w-full items-center gap-1",
        "rounded-[var(--dropdown-radius)] bg-(--color-toolbar-background) p-[0.4rem] shadow-elevation-high",
      ),
      className,
    )}
    {...props}
  />
));

export const Button = React.forwardRef(({ className, ...props }, ref) => (
  <Toolbar.Button
    ref={ref}
    className={twMerge(
      clsx(
        "inline-flex h-[2.5rem] w-[2.5rem] flex-none items-center justify-center",
        "rounded-[4px] text-text-normal outline-hidden transition-colors duration-100 ease-linear",
        "hover:bg-(--color-surface-muted)",
        "focus-visible:[box-shadow:var(--shadow-focus)]",
        "disabled:cursor-not-allowed disabled:text-text-muted disabled:hover:bg-transparent",
      ),
      className,
    )}
    {...props}
  />
));

export const Separator = React.forwardRef(({ className, ...props }, ref) => (
  <Toolbar.Separator
    ref={ref}
    className={twMerge(
      clsx("mx-[0.3rem] my-0 h-[70%] w-px bg-(--color-border-light)"),
      className,
    )}
    {...props}
  />
));
