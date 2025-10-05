import React from "react";
import clsx from "clsx";
import {
  useMenu,
  useMenuItem,
  useMenuSection,
  useSeparator,
  useMenuTrigger,
  useButton,
} from "react-aria";
import {
  Item,
  Section,
  useMenuTriggerState,
  useTreeState,
} from "react-stately";
import { isTouchDevice } from "@shades/common/utils";
import { Checkmark as CheckmarkIcon } from "./icons";
import * as Popover from "./popover.js";
import { twMerge } from "tailwind-merge";

const Context = React.createContext();

export const Root = ({
  children,
  placement = "bottom start",
  offset = 5,
  crossOffset,
  targetRef,
  ...props_
}) => {
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

  const state = useMenuTriggerState(props);
  const ref = React.useRef(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger({}, state, ref);

  return (
    <Popover.Root
      triggerRef={ref}
      targetRef={targetRef}
      placement={placement}
      offset={offset}
      crossOffset={crossOffset}
      isOpen={state.isOpen}
      onOpenChange={state.setOpen}
    >
      <Context.Provider
        value={{
          menuTriggerProps,
          menuProps,
          triggerRef: ref,
          state,
        }}
      >
        {children}
      </Context.Provider>
    </Popover.Root>
  );
};

export const Trigger = ({ children, asChild }) => {
  const { menuTriggerProps, triggerRef } = React.useContext(Context);
  const { buttonProps } = useButton(menuTriggerProps);
  const props = asChild ? menuTriggerProps : buttonProps;
  return React.cloneElement(children, { ...props, ref: triggerRef });
  // return children({ props: buttonProps, ref: triggerRef });
};

export const Content = ({
  items,
  onAction,
  selectionMode,
  selectedKeys,
  disabledKeys,
  onSelectionChange,
  widthFollowTrigger = false,
  footerNote,
  children,
  className,
  ...props
}) => {
  const { menuProps } = React.useContext(Context);
  return (
    <Popover.Content
      widthFollowTrigger={widthFollowTrigger}
      className={twMerge(
        clsx(
          "min-w-[var(--dropdown-min-width)] max-w-[var(--dropdown-max-width)]",
          "w-min rounded-[var(--dropdown-radius)] bg-(--color-surface-popover) p-[var(--dropdown-padding)] text-text-normal shadow-dropdown",
        ),
        className,
      )}
      {...props}
    >
      <Menu
        items={items}
        selectionMode={selectionMode}
        selectedKeys={selectedKeys}
        disabledKeys={disabledKeys}
        onAction={onAction}
        onSelectionChange={onSelectionChange}
        footerNote={footerNote}
        {...menuProps}
      >
        {children}
      </Menu>
    </Popover.Content>
  );
};

export { Item, Section };

const Menu = ({ footerNote, ...props }) => {
  const state = useTreeState(props);
  const ref = React.useRef(null);
  const { menuProps } = useMenu(props, state, ref);

  return (
    <>
      <ul
        ref={ref}
        className="flex list-none flex-col outline-hidden"
        {...menuProps}
      >
        {[...state.collection].map((item) =>
          item.type === "section" ? (
            <MenuSection key={item.key} section={item} state={state} />
          ) : (
            <MenuItem key={item.key} item={item} state={state} />
          ),
        )}
      </ul>
      {footerNote != null && (
        <div className="mt-[var(--dropdown-padding)] mx-[calc(var(--dropdown-padding)*-1)] border-t border-(--color-border-lighter) pt-[var(--dropdown-padding)]">
          <div className="px-(0.8rem) py-(0.4rem) text-[1.05rem] leading-[calc(16/12)] text-(--color-text-muted-alpha)">
            {footerNote}
          </div>
        </div>
      )}
    </>
  );
};

const MenuItem = ({ item, state }) => {
  const ref = React.useRef(null);
  const {
    menuItemProps,
    descriptionProps,
    labelProps,
    // isFocused,
    isSelected,
    // isDisabled,
  } = useMenuItem({ key: item.key }, state, ref);

  return (
    <li
      {...menuItemProps}
      ref={ref}
      className={clsx(
        "my-(0.1rem) flex w-full min-h-[var(--dropdown-item-height)] items-start justify-start gap-(0.8rem)",
        "rounded-[0.3rem] px-(0.8rem) py-(0.4rem) text-base leading-[calc(20/14)] text-text-normal",
        "cursor-pointer whitespace-nowrap transition-colors duration-100 ease-linear",
        "focus:bg-(--color-surface-muted) focus:outline-hidden",
        "aria-disabled:cursor-default aria-disabled:text-(--color-text-muted-alpha)",
        "aria-[checked=true]:bg-(--color-surface-selected) aria-[checked=true]:text-text-normal",
        "aria-[checked=true]:focus:text-text-accent",
        "data-danger:text-text-negative data-primary:text-text-primary",
      )}
      data-primary={item.props.primary || undefined}
      data-danger={item.props.danger || undefined}
    >
      {item.props.icon && (
        <div className="flex size-[auto] h-(2rem) w-(1.6rem) items-center justify-center py-(0.2rem)">
          {item.props.icon}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-(0.2rem)">
        <div {...labelProps}>{item.rendered ?? item.props.title}</div>
        {item.props.description && (
          <div
            className="text-[1.05rem] text-text-dimmed pb-(0.1rem)"
            {...descriptionProps}
          >
            {item.props.description}
          </div>
        )}
      </div>
      {(isSelected || item.props.iconRight) && (
        <div className="flex h-(2rem) w-(1.6rem) items-center justify-center py-(0.2rem)">
          {isSelected ? (
            <CheckmarkIcon className="h-auto w-(1.1rem)" />
          ) : (
            item.props.iconRight
          )}
        </div>
      )}
    </li>
  );
};

const MenuSection = ({ section, state, onAction, onClose }) => {
  const { itemProps, headingProps, groupProps } = useMenuSection({
    heading: section.rendered,
    "aria-label": section["aria-label"],
  });

  const { separatorProps } = useSeparator({
    elementType: "li",
  });

  return (
    <>
      {section.key !== state.collection.getFirstKey() && (
        <li
          {...separatorProps}
          className="mx-[calc(var(--dropdown-padding)*-1)] my-(0.5rem) h-(0.1rem) bg-(--color-border-lighter)"
        />
      )}
      <li {...itemProps}>
        {section.rendered && (
          <span
            {...headingProps}
            className="block px-(0.8rem) text-xs font-medium uppercase text-text-dimmed"
          >
            {section.rendered}
          </span>
        )}
        <ul {...groupProps}>
          {[...section.childNodes].map((node) => (
            <MenuItem
              key={node.key}
              item={node}
              state={state}
              onAction={onAction}
              onClose={onClose}
            />
          ))}
        </ul>
      </li>
    </>
  );
};
