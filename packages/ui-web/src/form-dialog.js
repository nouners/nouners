import React from "react";
import clsx from "clsx";
import { message as messageUtils } from "@shades/common/utils";
import Input from "./input.js";
import RichTextEditor from "./rich-text-editor.js";
import DialogHeader from "./dialog-header.js";
import DialogFooter from "./dialog-footer.js";
import Select from "./select.js";
import { twMerge } from "tailwind-merge";

const FormDialog = ({
  title,
  titleProps,
  dismiss,
  controls,
  submit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  noFooter = false,
  children,
  className,
}) => {
  const firstInputRef = React.useRef();

  const [hasPendingSubmit, setPendingSubmit] = React.useState(false);

  const [state, setState] = React.useState(() =>
    controls.reduce(
      (acc, c) => ({ ...acc, [c.key]: c.initialValue ?? "" }),
      {},
    ),
  );

  const hasRequiredInput = controls.every((c) => {
    if (!c.required) return true;
    return c.validate(state[c.key]);
  });

  const handleSubmit = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (submit == null) return;

    setPendingSubmit(true);
    try {
      await submit(state);
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setPendingSubmit(false);
    }
  };

  React.useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const hasChanges = controls.some((c) => {
    const value = c.value ?? state[c.key];
    if (c.initialValue === undefined) return true;

    if (c.type === "rich-text") {
      return !messageUtils.isEqual(value, c.initialValue);
    }
    return value !== c.initialValue;
  });

  return (
    <div
      className={twMerge(
        clsx("flex min-h-0 flex-col", "p-[1.5rem] md:p-[2rem]"),
        className,
      )}
    >
      <DialogHeader title={title} titleProps={titleProps} dismiss={dismiss} />

      <main className="flex min-h-0 flex-1 overflow-auto p-[0.3rem] -m-[0.3rem]">
        <form
          id="dialog-form"
          onSubmit={handleSubmit}
          className="flex w-full flex-col"
        >
          {controls.map((c, i) => (
            <div key={c.key} className={clsx(i > 0 && "mt-8")}>
              {c.type === "select" ? (
                <Select
                  ref={i === 0 ? firstInputRef : undefined}
                  size={c.size ?? "large"}
                  value={c.value === undefined ? state[c.key] : c.value}
                  disabled={hasPendingSubmit}
                  onChange={(value) => {
                    setState((s) => ({ ...s, [c.key]: value }));
                    if (c.onChange) c.onChange(value);
                  }}
                  label={c.label}
                  placeholder={c.placeholder}
                  options={c.options}
                />
              ) : (
                <Input
                  ref={i === 0 ? firstInputRef : undefined}
                  size={c.size ?? "large"}
                  multiline={c.type === "multiline-text"}
                  component={
                    c.type === "rich-text" ? RichTextEditor : undefined
                  }
                  value={c.value === undefined ? state[c.key] : c.value}
                  disabled={hasPendingSubmit}
                  onChange={(event) => {
                    const value =
                      c.type === "rich-text" ? event : event.target.value;
                    setState((s) => ({ ...s, [c.key]: value }));
                    if (c.onChange) c.onChange(value);
                  }}
                  label={c.label}
                  placeholder={c.placeholder}
                  rows={c.rows}
                />
              )}

              {c.hint != null && (
                <div className="mt-(0.7rem) text-sm text-text-dimmed [&_strong]:font-semibold [&>p+p]:mt-[0.7em]">
                  {c.hint}
                </div>
              )}
            </div>
          ))}
        </form>
      </main>
      {children}

      {!noFooter && (
        <DialogFooter
          cancel={dismiss}
          cancelButtonLabel={cancelLabel}
          submitButtonLabel={submitLabel}
          submitButtonProps={{
            type: "submit",
            form: "dialog-form",
            isLoading: hasPendingSubmit,
            disabled: !hasChanges || !hasRequiredInput || hasPendingSubmit,
            className: "min-w-[8rem]",
          }}
        />
      )}
    </div>
  );
};

export default FormDialog;
