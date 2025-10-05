import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { Cross as CrossIcon } from "./icons.js";
import Button from "./button.js";

const DialogHeader = ({
  title,
  subtitle,
  titleProps,
  dismiss,
  className,
  ...props
}) => {
  const { className: titleClassName, ...restTitleProps } = titleProps ?? {};

  return (
    <header
      data-has-dismiss={dismiss != null ? "" : undefined}
      className={twMerge(
        clsx(
          "grid grid-cols-[minmax(0,1fr)_auto] items-start",
          "mb-6 md:mb-8",
          dismiss != null && "pt-[0.1em]",
        ),
        className,
      )}
      {...props}
    >
      <h1
        className={twMerge(
          clsx(
            "text-dialog-title text-(--color-text-header)",
            "font-semibold leading-[1.2]",
          ),
          titleClassName,
        )}
        {...restTitleProps}
      >
        {title}
        {subtitle != null && (
          <div className="mt-[0.2em] text-base font-normal leading-[1.3] text-text-dimmed">
            {subtitle}
          </div>
        )}
      </h1>
      {dismiss != null && (
        <Button
          size="small"
          onClick={() => dismiss()}
          className="mb-[-100%] w-[2.8rem] px-0 py-0"
          aria-label="Close dialog"
        >
          <CrossIcon className="mx-auto h-auto w-[1.5rem]" />
        </Button>
      )}
    </header>
  );
};

export default DialogHeader;
