import throttle from "lodash.throttle";
import React from "react";
import { useActions } from "@shades/common/app";
import { useMatchMedia, useFetch } from "@shades/common/react";
import * as Popover from "./popover.js";
import Dialog from "./dialog.js";
import Input from "./input";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const GifPickerTrigger = ({
  width = "34rem",
  height = "48rem",
  onSelect,
  isOpen,
  onOpenChange,
  placement = "top",
  offset = 10,
  trigger,
  ...pickerProps
}) => (
  <PopoverOrTrayDialog
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    placement={placement}
    offset={offset}
    trigger={trigger}
  >
    {({ type }) => (
      <GifPicker
        width={type === "popover" ? width : "100%"}
        height={type === "popover" ? height : "100%"}
        // columnCount={type === "popover" ? 3 : 2}
        onSelect={(item) => {
          onOpenChange(false);
          onSelect(item);
        }}
        {...pickerProps}
      />
    )}
  </PopoverOrTrayDialog>
);

const GifPicker = ({
  width = "auto",
  height = "100%",
  columnCount = 2,
  onSelect,
}) => {
  const inputRef = React.useRef();

  const [items, setItems] = React.useState([]);
  const { searchGifs } = useActions();

  const [highlightedIndex, setHighlightedIndex] = React.useState(null);
  const deferredHighlightedIndex = React.useDeferredValue(highlightedIndex);
  const highlightedItem = items[deferredHighlightedIndex];

  const [query, setQuery] = React.useState("");
  const trimmedQuery = React.useDeferredValue(query.trim().toLowerCase());

  const throttledSearchGifs = React.useMemo(
    () =>
      throttle((query, { signal }) => {
        if (query.length === 1) return Promise.resolve();
        return searchGifs(query || "amaze").then((gifs) => {
          if (signal?.aborted) return;
          setItems(gifs);
        });
      }, 800),
    [searchGifs],
  );

  useFetch(
    ({ signal }) => throttledSearchGifs(trimmedQuery, { signal }),
    [throttledSearchGifs, trimmedQuery],
  );

  const selectHighlightedItem = () => {
    const item = items[highlightedIndex];
    onSelect({ url: item.src });
  };

  const navigationBlockedRef = React.useRef();

  // Hack to make the UI not freeze when you navigate by pressing and holding e.g. arrow down
  const wrapNavigationKeydownHandler = (handler) => {
    if (navigationBlockedRef.current) return;
    navigationBlockedRef.current = true;
    handler();
    requestAnimationFrame(() => {
      navigationBlockedRef.current = false;
    });
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowUp": {
        wrapNavigationKeydownHandler(() => {
          const lastIndex = items.length - 1;
          setHighlightedIndex((prevIndex) => {
            if (prevIndex == null) return lastIndex;
            const columnIndex = prevIndex % columnCount;
            if (prevIndex - columnCount < 0) {
              const lastRowItemCount = items.length % columnCount;
              return columnIndex > lastRowItemCount - 1
                ? lastIndex
                : items.length - lastRowItemCount + columnIndex;
            }
            return prevIndex - columnCount;
          });
          event.preventDefault();
        });
        break;
      }
      case "ArrowDown": {
        wrapNavigationKeydownHandler(() => {
          const lastIndex = items.length - 1;
          setHighlightedIndex((prevIndex) => {
            if (prevIndex == null) return 0;
            const columnIndex = prevIndex % columnCount;
            if (prevIndex + columnCount > lastIndex) {
              const lastRowItemCount = items.length % columnCount;
              // Wrap around if we’re on the last row
              if (prevIndex > lastIndex - lastRowItemCount) return columnIndex;
              // Fall back to the last index if no item exists
              return columnIndex > lastRowItemCount - 1
                ? lastIndex
                : items.length - lastRowItemCount + columnIndex;
            }
            return prevIndex + columnCount;
          });
          event.preventDefault();
        });
        break;
      }
      case "ArrowLeft": {
        wrapNavigationKeydownHandler(() => {
          setHighlightedIndex((prevIndex) => {
            if (prevIndex == null) return columnCount - 1;
            return Math.max(prevIndex - 1, 0);
          });
          event.preventDefault();
        });
        break;
      }
      case "ArrowRight": {
        wrapNavigationKeydownHandler(() => {
          setHighlightedIndex((prevIndex) => {
            if (prevIndex == null) return 1;
            return Math.min(prevIndex + 1, items.length - 1);
          });
          event.preventDefault();
        });
        break;
      }
      case "Enter": {
        selectHighlightedItem();
        event.preventDefault();
        break;
      }
    }
  };

  React.useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <div className="flex flex-col" style={{ height, width }}>
      <div className="relative z-[2] px-[0.8rem] pb-0 pt-[0.8rem]">
        <Input
          size="small"
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedIndex(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            highlightedIndex == null
              ? "Search"
              : (highlightedItem?.title ?? "Search")
          }
        />
      </div>

      <div
        className="relative flex-1 min-h-0 overflow-auto px-[0.4rem] pb-[0.4rem] pt-[0.6rem]"
        style={{ "--column-count": columnCount }}
      >
        <div className="flex flex-wrap">
          {items.map((item, i) => {
            const isHighlighted = highlightedIndex === i;
            return (
              <div
                key={item.id}
                className="min-w-0"
                // ref={(el) => {
                //   if (el == null) return;
                //   if (isHighlighted)
                //     el.scrollIntoView({
                //       block: "nearest",
                //       behavior: "smooth",
                //     });
                // }}
                style={{ width: "calc(100% / var(--column-count))" }}
              >
                <button
                  key={item.id}
                  className={twMerge(
                    clsx(
                      "flex w-full items-center justify-center rounded-[0.5rem] p-[0.4rem] transition-colors duration-100 ease-linear",
                      "outline-none focus-visible:relative focus-visible:z-[2] focus-visible:shadow-focus",
                      "data-[selected=true]:bg-(--color-surface-muted)",
                    ),
                  )}
                  data-selected={isHighlighted ? "true" : undefined}
                  onClick={() => {
                    onSelect({ url: item.src });
                  }}
                  onPointerMove={() => {
                    if (highlightedIndex === i) return;
                    setHighlightedIndex(i);
                  }}
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="mx-auto block h-auto w-full rounded-[0.3rem] object-cover"
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const PopoverOrTrayDialog = ({
  isOpen,
  onOpenChange,
  placement = "top",
  offset,
  trigger,
  children,
}) => {
  const inputDeviceCanHover = useMatchMedia("(hover: hover)");
  const close = () => {
    onOpenChange(false);
  };

  if (inputDeviceCanHover)
    return (
      <Popover.Root
        placement={placement}
        offset={offset}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <Popover.Trigger asChild>{trigger}</Popover.Trigger>
        <Popover.Content>
          {/* <Popover.Arrow /> */}
          {typeof children === "function"
            ? children({ type: "popover" })
            : children}
        </Popover.Content>
      </Popover.Root>
    );

  // Tray dialog on touch devices
  return (
    <>
      {trigger}
      <Dialog isOpen={isOpen} onRequestClose={close} backdrop="none" tray>
        <div className="flex-1 min-h-0 rounded-t-[0.6rem] bg-(--color-surface-popover) px-[0.4rem] pb-0 pt-[0.4rem] shadow-elevation-high">
          {typeof children === "function"
            ? children({ type: "tray" })
            : children}
        </div>
      </Dialog>
    </>
  );
};

export default GifPickerTrigger;
