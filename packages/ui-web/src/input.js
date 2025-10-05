import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { AutoAdjustingHeightTextarea } from "@shades/common/react";

let id = 0;
const genId = () => {
  return ++id;
};

const paddingBySize = {
  small: "py-(0.5rem) px-(0.7rem)",
  normal: "py-(0.7rem) px-(0.9rem)",
  large: "py-(0.9rem) px-(1.1rem)",
};

const fontBySize = {
  small: "text-input",
  normal: "text-input",
  large: "text-lg",
};

const baseInputClasses = clsx(
  "block w-full max-w-full rounded-md border-none bg-(--color-surface-muted)",
  "text-text-normal font-normal outline-hidden transition-shadow duration-100 ease-linear",
  "focus-visible:focus-ring placeholder:text-(--color-input-placeholder)",
  "disabled:bg-(--color-surface-strong) disabled:text-text-muted disabled:pointer-events-none",
  '[&[type="date"]]:appearance-none [&[type="time"]]:appearance-none',
  "[&::-webkit-datetime-edit]:leading-none [&::-webkit-datetime-edit]:inline [&::-webkit-datetime-edit]:p-0",
  "[@supports(-webkit-touch-callout:none)]:text-(1.6rem)",
);

const Input = React.forwardRef(
  (
    {
      size = "normal",
      multiline = false,
      component: CustomComponent,
      label,
      hint,
      containerProps,
      labelProps,
      className,
      style,
      rows,
      ...rest
    },
    ref,
  ) => {
    const [generatedId] = React.useState(() => genId());

    const Component =
      CustomComponent != null
        ? CustomComponent
        : multiline
          ? AutoAdjustingHeightTextarea
          : "input";

    const resolvedSize = fontBySize[size] != null ? size : "normal";

    const renderInput = (extraProps = {}) => {
      const combinedClassName = twMerge(
        clsx(
          baseInputClasses,
          fontBySize[resolvedSize],
          paddingBySize[resolvedSize],
          multiline && "resize-none",
          className,
          extraProps.className,
        ),
      );

      const mergedStyle = {
        ...style,
        ...extraProps.style,
      };

      return (
        <Component
          ref={ref}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="off"
          rows={multiline && rows == null ? 1 : rows}
          {...rest}
          {...extraProps}
          className={combinedClassName}
          style={mergedStyle}
        />
      );
    };

    if (label == null && hint == null) return renderInput();

    const { className: containerClassName, ...containerRest } =
      containerProps ?? {};

    const { className: labelClassName, ...labelRest } = labelProps ?? {};

    return (
      <div className={containerClassName} {...containerRest}>
        {label != null && (
          <Label
            htmlFor={generatedId}
            className={labelClassName}
            {...labelRest}
          >
            {label}
          </Label>
        )}
        {renderInput({ id: generatedId })}
        {hint != null && (
          <div className="mt-(0.7rem) text-text-dimmed text-sm [&_strong]:font-semibold [&>p+p]:mt-[0.7em]">
            {hint}
          </div>
        )}
      </div>
    );
  },
);

export const Label = ({ className, ...props }) => (
  <label
    className={twMerge(
      "inline-block text-text-dimmed text-base leading-[1.2] mb-4",
      className,
    )}
    {...props}
  />
);

Input.displayName = "Input";

export default Input;
