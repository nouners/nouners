import React from "react";
import { Item, useSelectState } from "react-stately";
import { HiddenSelect, useSelect, useListBox, useOption } from "react-aria";
import { isTouchDevice } from "@shades/common/utils";
import Button from "./button.js";
import { Label } from "./input.js";
import * as Popover from "./popover.js";
import {
  CaretDown as CaretDownIcon,
  Checkmark as CheckmarkIcon,
} from "./icons.js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const caretConfigBySize = {
  tiny: {
    width: "0.8rem",
    padding: 0,
  },
  small: {
    width: "0.9rem",
    padding: 0,
  },
};

const Select = React.forwardRef(
  (
    {
      placeholder = "Select an item",
      inlineLabel,
      renderTriggerContent,
      value,
      options,
      onChange,
      icon,
      variant,
      size = "default",
      align = "left",
      width,
      fullWidth = true,
      multiline = false,
      buttonProps,
      ...props_
    },
    forwardedRef,
  ) => {
    const [isOpen, setOpen] = React.useState(false);

    // Workaround for https://github.com/adobe/react-spectrum/issues/1513
    const props = {
      isOpen,
      onOpenChange: (open) => {
        if (open || !isTouchDevice()) {
          setOpen(open);
          return;
        }

        const touchendHandler = (e) => {
          e.preventDefault();
          clearTimeout(id);
          setOpen(open);
        };
        const id = setTimeout(() => {
          document.removeEventListener("touchend", touchendHandler);
          setOpen(open);
        }, 1000);
        document.addEventListener("touchend", touchendHandler, {
          once: true,
          capture: true,
        });
      },
      ...props_,
    };

    const selectProps = {
      ...props,
      selectedKey: value,
      disabledKeys: options.filter((o) => o.disabled).map((o) => o.value),
      onSelectionChange: (key) => onChange(key),
      items: options.map((o) => ({
        ...o,
        label: o.label ?? o.value,
        key: o.value,
      })),
      children: (o) => <Item textValue={o.textValue ?? o.label} />,
      isDisabled: props.disabled,
    };

    const state = useSelectState(selectProps);

    const internalRef = React.useRef();
    const triggerRef = forwardedRef ?? internalRef;
    const {
      // labelProps,
      triggerProps,
      valueProps,
      menuProps,
    } = useSelect(selectProps, state, triggerRef);

    const caretSize = caretConfigBySize[size]?.width ?? "1.1rem";
    const caretPadding = caretConfigBySize[size]?.padding ?? "0 0.2rem";

    return (
      <>
        {props.label != null && (
          <Label htmlFor={triggerProps.id}>{props.label}</Label>
        )}

        <HiddenSelect
          state={state}
          triggerRef={triggerRef}
          label={props.label}
          name={props.name}
        />

        <Popover.Root
          placement={`bottom ${align}`}
          offset={5}
          isOpen={state.isOpen}
          onOpenChange={state.setOpen}
          triggerRef={triggerRef}
        >
          <Popover.Trigger asButtonChild {...triggerProps}>
            <Button
              fullWidth={fullWidth}
              multiline={multiline}
              size={size}
              variant={variant}
              icon={icon ?? state.selectedItem?.value.icon}
              align={align}
              iconRight={
                <div style={{ padding: caretPadding }}>
                  <CaretDownIcon style={{ width: caretSize }} />
                </div>
              }
              {...buttonProps}
            >
              <span {...valueProps}>
                {renderTriggerContent != null ? (
                  renderTriggerContent(state.selectedItem?.key, options)
                ) : state.selectedItem == null ? (
                  placeholder
                ) : inlineLabel != null ? (
                  <>
                    {inlineLabel}:{" "}
                    <em className="not-italic font-semibold">
                      {state.selectedItem.value.inlineLabel ??
                        state.selectedItem.value.label}
                    </em>
                  </>
                ) : (
                  <>
                    <div>{state.selectedItem.value.label}</div>
                    {state.selectedItem.value.description != null && (
                      <div className="text-sm text-text-dimmed">
                        {state.selectedItem.value.description}
                      </div>
                    )}
                  </>
                )}
              </span>
            </Button>
          </Popover.Trigger>
          <Popover.Content
            width={width}
            widthFollowTrigger={width == null}
            className="w-min"
          >
            <ListBox {...menuProps} state={state} />
          </Popover.Content>
        </Popover.Root>
      </>
    );
  },
);

const ListBox = ({ state, ...props }) => {
  const ref = React.useRef();
  const {
    listBoxProps,
    // labelProps
  } = useListBox(props, state, ref);

  return (
    <>
      {/* <div {...labelProps}>{props.label}</div> */}
      <ul
        {...listBoxProps}
        ref={ref}
        className="block list-none p-[var(--dropdown-padding)] outline-hidden"
      >
        {[...state.collection].map((item) => (
          <Option key={item.key} item={item} state={state} />
        ))}
      </ul>
    </>
  );
};

const Option = ({ item, state }) => {
  const ref = React.useRef();
  const { optionProps, labelProps, descriptionProps, isSelected, isDisabled } =
    useOption({ key: item.key }, state, ref);

  // const { isFocusVisible, focusProps } = useFocusRing();

  return (
    <li
      {...optionProps}
      ref={ref}
      className={twMerge(
        clsx(
          "flex min-h-[var(--dropdown-item-height)] items-center justify-start gap-3",
          "rounded-[0.3rem] px-[0.8rem] py-[0.5rem] text-base font-normal leading-[1.4] outline-hidden",
          "transition-colors duration-100 ease-linear",
          isDisabled
            ? "cursor-not-allowed text-text-muted"
            : "cursor-pointer text-text-normal hover:bg-(--color-surface-muted)",
          "focus:bg-(--color-surface-muted)",
          "aria-[selected=true]:bg-(--color-surface-selected)",
        ),
      )}
    >
      {item.value.icon != null && (
        <div className="flex w-[3rem] items-center justify-center text-current">
          {item.value.icon}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-[0.2rem]">
        <div {...labelProps}>{item.value.label}</div>
        {item.value.description != null && (
          <div
            {...descriptionProps}
            className={clsx(
              "text-sm",
              isDisabled ? "text-text-muted" : "text-text-dimmed",
            )}
          >
            {item.value.description}
          </div>
        )}
      </div>
      <div className="ml-[1.2rem] px-[0.5rem]">
        {isSelected ? (
          <CheckmarkIcon className="h-auto w-[1.1rem]" />
        ) : (
          <div className="h-[1.1rem] w-[1.1rem]" />
        )}
      </div>
    </li>
  );
};

export default Select;
