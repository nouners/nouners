import { useComposedRefs } from "@shades/common/react";
import clsx from "clsx";
import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import {
  DismissButton,
  mergeProps,
  Overlay,
  usePopover,
  useOverlayTrigger,
  useButton,
  useDialog,
} from "react-aria";
import { twMerge } from "tailwind-merge";

const Dialog = ({ children, ...props }) => {
  const ref = React.useRef();

  const { dialogProps } = useDialog(props, ref);
  return (
    <div ref={ref} {...dialogProps} style={{ outline: "none" }}>
      {children}
    </div>
  );
};

const Context = React.createContext();

export const Root = ({
  isOpen,
  onOpenChange,
  children,
  placement: preferredPlacement = "top",
  offset = 8,
  crossOffset = 0,
  containerPadding = 10,
  triggerRef: triggerRefExternal,
  targetRef,
  isDialog = true,
  dialogProps = {},
  ...props
}) => {
  const state = useOverlayTriggerState({ isOpen, onOpenChange });

  const popoverRef = React.useRef();
  const triggerRefInternal = React.useRef();
  const triggerRef = triggerRefExternal ?? triggerRefInternal;

  const { triggerProps, overlayProps } = useOverlayTrigger(
    { type: "dialog" },
    state,
    triggerRef,
  );

  return (
    <Context.Provider
      value={{
        state,
        triggerRef,
        popoverRef,
        triggerProps,
        targetRef,
        overlayProps,
        dialogProps,
        placement: preferredPlacement,
        offset,
        crossOffset,
        containerPadding,
        isDialog,
        popoverInputProps: props,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const Trigger = React.forwardRef(
  ({ asButtonChild, asChild, children, disabled, ...props }, forwardedRef) => {
    const { triggerProps, triggerRef } = React.useContext(Context);
    const useButtonInput = {
      ...triggerProps,
      ...props,
      isDisabled: disabled ?? props.isDisabled,
    };
    const { buttonProps } = useButton(useButtonInput);

    const ref = useComposedRefs(triggerRef, forwardedRef);

    return asButtonChild ? (
      React.cloneElement(children, { ...useButtonInput, ref })
    ) : asChild ? (
      React.cloneElement(children, { ...buttonProps, ref })
    ) : (
      <button {...props} {...buttonProps} ref={ref}>
        {children}
      </button>
    );
  },
);

const ContentInner = React.forwardRef(
  (
    { width, widthFollowTrigger, children, className, ...props },
    forwardedRef,
  ) => {
    const {
      isDialog,
      state,
      popoverRef,
      dialogProps,
      overlayProps,
      triggerRef,
      targetRef,
      placement: preferredPlacement,
      offset,
      crossOffset,
      containerPadding,
      popoverInputProps,
    } = React.useContext(Context);

    const { popoverProps, underlayProps } = usePopover(
      {
        isNonModal: !isDialog,
        ...props,
        triggerRef: targetRef ?? triggerRef,
        popoverRef,
        placement: preferredPlacement,
        offset,
        crossOffset,
        containerPadding,
        ...popoverInputProps,
      },
      state,
    );

    const ref = useComposedRefs(popoverRef, forwardedRef);
    const anchorRef = targetRef ?? triggerRef;

    const containerProps = isDialog
      ? mergeProps(props, dialogProps, overlayProps, popoverProps)
      : mergeProps(props, overlayProps, popoverProps);

    const {
      className: containerClassName,
      style: containerStyle,
      ...otherContainerProps
    } = containerProps;

    const dismissButtonElement = <DismissButton onDismiss={state.close} />;

    const baseClasses = clsx(
      "relative z-[10] min-w-min max-w-[calc(100vw-2rem)] overflow-auto",
      "rounded-md bg-(--color-surface-popover) text-text-normal shadow-elevation-high",
      "outline-hidden",
      "data-[width-behavior=follow-trigger]:min-w-0",
      "data-[width-behavior=follow-trigger]:w-[var(--trigger-width)]",
    );

    return (
      <>
        {isDialog && <div {...underlayProps} className="fixed inset-0" />}
        <div
          ref={ref}
          data-width-behavior={
            widthFollowTrigger ? "follow-trigger" : undefined
          }
          className={twMerge(baseClasses, className, containerClassName)}
          {...otherContainerProps}
          style={{
            ...containerStyle,
            zIndex: 10,
            colorScheme: "var(--color-scheme, light)",
            width: "var(--custom-width, auto)",
            "--custom-width": width ?? undefined,
            "--trigger-width":
              anchorRef.current == null
                ? undefined
                : `${anchorRef.current.offsetWidth}px`,
          }}
        >
          {dismissButtonElement}
          {isDialog ? (
            <Dialog {...dialogProps}>
              {typeof children === "function"
                ? children({ close: state.close })
                : React.cloneElement(children, { close: state.close })}
            </Dialog>
          ) : (
            children
          )}
          {dismissButtonElement}
        </div>
      </>
    );
  },
);

export const Content = React.forwardRef((props, ref) => {
  const { state } = React.useContext(Context);

  if (!state.isOpen) return null;

  return (
    <Overlay>
      <ContentInner {...props} ref={ref} />
    </Overlay>
  );
});
