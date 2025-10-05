import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import Button from "./button.js";

const DialogFooter = ({
  cancel,
  cancelButtonLabel,
  submitButtonLabel,
  submitButtonProps,
  className,
  ...props
}) => (
  <footer
    className={twMerge(
      clsx("flex justify-end pt-[2.5rem] md:pt-[3rem]"),
      className,
    )}
    {...props}
  >
    <div className="flex gap-4">
      {cancel != null && (
        <Button type="button" size="medium" onClick={cancel}>
          {cancelButtonLabel}
        </Button>
      )}
      {submitButtonLabel != null && (
        <Button
          size="medium"
          variant="primary"
          type="submit"
          {...submitButtonProps}
        >
          {submitButtonLabel}
        </Button>
      )}
    </div>
  </footer>
);

export default DialogFooter;
