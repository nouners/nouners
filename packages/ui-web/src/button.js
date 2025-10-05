import React from "react";
import { useButton, mergeProps } from "react-aria";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export const heightBySize = {
  default: "3.2rem",
  tiny: "2rem",
  small: "2.8rem",
  medium: "3.6rem",
};

const iconLayoutPropsBySize = {
  default: { size: "3.2rem", gutter: "0.8rem" },
  tiny: { size: "2rem", gutter: "0.2rem" },
  small: { size: "2.8rem", gutter: "0.4rem" },
  medium: { size: "3rem", gutter: "0.8rem" },
  large: { size: "3.2rem", gutter: "1rem" },
  larger: { size: "3.2rem", gutter: "1.4rem" },
};

const defaultPropsByComponent = {
  button: {
    type: "button",
  },
};

const loadingDotCount = 3;

const getSizeClasses = ({ size, align, hasIconOnly, multiline }) => {
  switch (size) {
    case "tiny":
      return clsx(
        "text-sm",
        "rounded-[0.5rem]",
        multiline ? "min-h-10 py-(0.5rem)" : "h-10",
        hasIconOnly ? "size-10 px-0" : "px-2",
      );
    case "small":
      return clsx(
        "text-base",
        "rounded-[0.5rem]",
        multiline ? "min-h-14 py-(0.5rem)" : "h-14",
        hasIconOnly
          ? "size-14 px-0"
          : align === "left"
            ? "px-(0.7rem)"
            : "px-(0.9rem)",
      );
    case "medium":
      return clsx(
        "text-button",
        multiline ? "min-h-18 py-(0.7rem)" : "h-18",
        hasIconOnly
          ? "size-18 px-0"
          : align === "left"
            ? "px-(0.9rem)"
            : "px-(1.7rem)",
      );
    case "large":
      return clsx(
        "text-button",
        "rounded-md",
        "py-(1.2rem)",
        hasIconOnly
          ? "px-(1.2rem)"
          : align === "left"
            ? "px-(1.2rem)"
            : "px-(2rem)",
      );
    case "larger":
      return clsx(
        "text-xl",
        "py-(1.4rem)",
        hasIconOnly
          ? "px-(1.4rem)"
          : align === "left"
            ? "px-(1.4rem)"
            : "px-(2.8rem)",
      );
    default:
      return clsx(
        "text-base",
        "rounded-md",
        multiline ? "min-h-16" : "h-16",
        hasIconOnly ? "size-16 px-0" : align === "left" ? "px-4" : "px-6",
      );
  }
};

const getVariantClasses = (variant, danger) => {
  switch (variant) {
    case "opaque":
      return clsx(
        "border border-transparent",
        "bg-(--color-surface-muted)",
        "text-text-dimmed",
        "hover:text-text-accent",
      );
    case "transparent":
      return clsx(
        "border border-transparent",
        "bg-transparent",
        danger ? "text-text-negative" : "text-text-normal",
        danger
          ? "hover:bg-(--color-danger-hover)"
          : "hover:bg-(--color-surface-muted)",
        !danger && "hover:text-text-accent",
      );
    case "primary":
      return clsx(
        "border border-transparent",
        "bg-accent-primary",
        "text-white",
        "hover:bg-accent-hover",
        "focus-visible:[box-shadow:0_0_0_0.3rem_var(--color-accent-soft)]",
      );
    case "tag":
      return clsx(
        "border",
        danger
          ? "border-border-danger text-text-negative"
          : "border-border-light text-text-normal",
        "uppercase font-semibold tracking-[0.08em]",
        danger
          ? "hover:bg-(--color-danger-hover)"
          : "hover:bg-(--color-surface-muted)",
      );
    case "default":
    default:
      return danger
        ? "border border-border-danger text-text-negative hover:bg-(--color-danger-hover)"
        : "border border-border-light text-text-normal hover:bg-(--color-surface-muted)";
  }
};

const Button = React.forwardRef(
  (
    {
      size = "medium",
      variant = "default",
      danger = false,
      fullWidth = false,
      multiline,
      align = "center",
      icon,
      iconRight,
      isLoading = false,
      isDisabled,
      onClick,
      onPress,
      onPressStart,
      component: Component = "button",
      children,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const { buttonProps } = useButton(
      {
        ...props,
        children,
        isDisabled: isDisabled ?? props.disabled,
        elementType: Component,
        onPress: onPress ?? onClick,
        onPressStart,
      },
      ref,
    );

    const hasIconOnly = icon != null && children == null;
    const sizeClasses = getSizeClasses({
      size,
      align,
      hasIconOnly,
      multiline,
    });
    const variantClasses = getVariantClasses(variant, danger);
    const iconLayout =
      iconLayoutPropsBySize[size] ?? iconLayoutPropsBySize.default;

    const rootClassName = twMerge(
      clsx(
        "relative inline-flex items-center justify-center select-none font-normal leading-[1.25] text-center transition-colors duration-75 ease-linear whitespace-nowrap overflow-hidden text-ellipsis outline-hidden",
        "focus-visible:outline-hidden focus-visible:focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        align === "left" ? "justify-start text-left" : "justify-center",
        fullWidth && "w-full",
        isLoading && "pointer-events-none",
        sizeClasses,
        variantClasses,
        className,
      ),
    );

    return (
      <Component
        ref={ref}
        {...defaultPropsByComponent[Component]}
        {...mergeProps(props, buttonProps)}
        className={rootClassName}
        style={style}
        aria-busy={isLoading || undefined}
      >
        {icon != null && (
          <div
            aria-hidden="true"
            className={clsx(
              "flex shrink-0 items-center justify-center text-current",
              "min-w-(1.2rem)",
              `max-w-(${iconLayout.size})`,
              children != null && `mr-(${iconLayout.gutter})`,
            )}
          >
            {icon}
          </div>
        )}
        {children != null && (
          <div
            className={clsx(
              "flex-1 min-w-0 overflow-hidden text-ellipsis",
              isLoading && "invisible",
            )}
          >
            {children}
          </div>
        )}
        {iconRight != null && (
          <div
            aria-hidden="true"
            className={clsx(
              "flex shrink-0 items-center justify-center text-current",
              `min-w-(${iconLayout.size})`,
              `max-w-(${iconLayout.size})`,
              "ml-(${iconLayout.gutter})",
            )}
          >
            {iconRight}
          </div>
        )}
        {isLoading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {Array.from({ length: loadingDotCount }).map((_, i) => (
              <div
                key={i}
                className="animate-loading-dots size-(0.4rem) rounded-full bg-current mx-(0.1rem)"
                style={{ animationDelay: `${i / 5}s` }}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </Component>
    );
  },
);

Button.displayName = "Button";

export default Button;
