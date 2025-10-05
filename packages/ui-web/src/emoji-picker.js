import React from "react";
import { useEmojis } from "@shades/common/app";
import { array as arrayUtils, emoji as emojiUtils } from "@shades/common/utils";
import Input from "./input";
import { PopoverOrTrayDialog } from "./gif-picker.js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const { groupBy } = arrayUtils;
const { search: searchEmoji } = emojiUtils;

const EmojiPickerTrigger = ({
  width = "31.6rem",
  height = "28.4rem",
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
    trigger={trigger}
    offset={offset}
  >
    {({ type }) => (
      <EmojiPicker
        width={type === "popover" ? width : "100%"}
        height={type === "popover" ? height : "100%"}
        onSelect={(item) => {
          onOpenChange(false);
          onSelect(item);
        }}
        {...pickerProps}
      />
    )}
  </PopoverOrTrayDialog>
);

// Super hacky and inaccessible
const EmojiPicker = ({ width = "auto", height = "100%", onSelect }) => {
  const inputRef = React.useRef();

  const { allEntries: emojis, recentlyUsedEntries: recentEmojis } = useEmojis();

  const emojiByCategoryEntries = React.useMemo(
    () => Object.entries(groupBy((e) => e.category, emojis)),
    [emojis],
  );

  const [highlightedEntry, setHighlightedEntry] = React.useState(null);
  const deferredHighlightedEntry = React.useDeferredValue(highlightedEntry);

  const [query, setQuery] = React.useState("");
  const trimmedQuery = React.useDeferredValue(query.trim().toLowerCase());

  const filteredEmojisByCategoryEntries = React.useMemo(() => {
    if (trimmedQuery.length === 0) {
      if (recentEmojis.length === 0) return emojiByCategoryEntries;
      return [
        ["Recently used", recentEmojis.slice(0, 4 * 9)],
        ...emojiByCategoryEntries,
      ];
    }

    const emoji = emojiByCategoryEntries.flatMap((entry) => entry[1]);
    return [[undefined, searchEmoji(emoji, trimmedQuery)]];
  }, [emojiByCategoryEntries, recentEmojis, trimmedQuery]);

  const highlightedEmojiItem = React.useMemo(
    () =>
      deferredHighlightedEntry == null
        ? null
        : filteredEmojisByCategoryEntries[deferredHighlightedEntry[0]][1][
            deferredHighlightedEntry[1]
          ],
    [deferredHighlightedEntry, filteredEmojisByCategoryEntries],
  );

  const ROW_LENGTH = 9;

  const addReactionAtEntry = ([ci, ei]) => {
    const { id, emoji } = filteredEmojisByCategoryEntries[ci][1][ei];
    onSelect(emoji ?? id);
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
          setHighlightedEntry((e) => {
            if (e == null) return null;
            const [ci, ei] = e;
            if (ei - ROW_LENGTH >= 0) return [ci, ei - ROW_LENGTH];
            if (ci === 0) return null;
            const targetColumn = ei;
            const previousCategoryItems =
              filteredEmojisByCategoryEntries[ci - 1][1];
            const lastRowLength =
              previousCategoryItems.length % ROW_LENGTH === 0
                ? ROW_LENGTH
                : previousCategoryItems.length % ROW_LENGTH;
            return [
              ci - 1,
              lastRowLength - 1 >= targetColumn
                ? previousCategoryItems.length - lastRowLength + targetColumn
                : previousCategoryItems.length - 1,
            ];
          });
          event.preventDefault();
        });
        break;
      }
      case "ArrowDown": {
        wrapNavigationKeydownHandler(() => {
          setHighlightedEntry((e) => {
            if (filteredEmojisByCategoryEntries.length === 0) return null;
            if (e == null) return [0, 0];
            const [ci, ei] = e;
            const categoryItems = filteredEmojisByCategoryEntries[ci][1];
            if (ei + ROW_LENGTH <= categoryItems.length - 1)
              return [ci, ei + ROW_LENGTH];
            const lastRowStartIndex =
              categoryItems.length % ROW_LENGTH === 0
                ? categoryItems.length - ROW_LENGTH
                : categoryItems.length - (categoryItems.length % ROW_LENGTH);

            if (ei < lastRowStartIndex) return [ci, categoryItems.length - 1];
            if (ci === filteredEmojisByCategoryEntries.length - 1)
              return [ci, ei];
            const targetColumn = ei % ROW_LENGTH;
            const nextCategoryItems =
              filteredEmojisByCategoryEntries[ci + 1][1];
            return [
              ci + 1,
              nextCategoryItems.length - 1 >= targetColumn
                ? targetColumn
                : nextCategoryItems.length - 1,
            ];
          });
          event.preventDefault();
        });
        break;
      }
      case "ArrowLeft": {
        wrapNavigationKeydownHandler(() => {
          setHighlightedEntry((e) => {
            if (e == null) return null;
            const [ci, ei] = e;
            if (ei - 1 >= 0) return [ci, ei - 1];
            if (ci === 0) {
              const categoryItems = filteredEmojisByCategoryEntries[ci][1];
              return [
                ci,
                categoryItems.length >= ROW_LENGTH
                  ? ROW_LENGTH - 1
                  : categoryItems.length - 1,
              ];
            }
            const previousCategoryItems =
              filteredEmojisByCategoryEntries[ci - 1][1];
            return [ci - 1, previousCategoryItems.length - 1];
          });
          event.preventDefault();
        });
        break;
      }
      case "ArrowRight": {
        wrapNavigationKeydownHandler(() => {
          setHighlightedEntry((e) => {
            if (e == null) return null;
            const [ci, ei] = e;
            const categoryItems = filteredEmojisByCategoryEntries[ci][1];
            if (ei + 1 <= categoryItems.length - 1) return [ci, ei + 1];
            if (ci === filteredEmojisByCategoryEntries.length - 1)
              return [ci, ei];
            return [ci + 1, 0];
          });
          event.preventDefault();
        });
        break;
      }
      case "Enter": {
        addReactionAtEntry(highlightedEntry);
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
      <div className="px-[0.7rem] pb-[0.3rem] pt-[0.7rem]">
        <Input
          size="small"
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedEntry(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            highlightedEmojiItem == null
              ? "Search"
              : (highlightedEmojiItem.description ?? "Search")
          }
        />
      </div>

      <div className="relative flex-1 overflow-auto scroll-pt-[3rem] scroll-pb-[0.5rem] pb-[0.7rem]">
        {filteredEmojisByCategoryEntries.map(([category, emojis], ci) => (
          <div key={category ?? "no-category"}>
            {category != null && (
              <div
                className="sticky top-0 z-[1] px-[0.9rem] py-[0.6rem] text-[1.2rem] font-medium uppercase text-text-dimmed"
                style={{
                  pointerEvents: "none",
                  background:
                    "linear-gradient(-180deg, var(--color-surface-popover) 50%, transparent)",
                }}
              >
                {category}
              </div>
            )}

            <div
              className="grid grid-cols-[repeat(auto-fill,minmax(3.4rem,1fr))] justify-between px-[0.5rem]"
              style={{ paddingTop: category == null ? "0.8rem" : undefined }}
            >
              {emojis.map(({ id, emoji, url }, i) => {
                const isHighlighted =
                  highlightedEntry != null &&
                  highlightedEntry[0] === ci &&
                  highlightedEntry[1] === i;
                return (
                  <button
                    key={id ?? emoji}
                    ref={(el) => {
                      if (el == null) return;
                      if (isHighlighted)
                        el.scrollIntoView({ block: "nearest" });
                    }}
                    className={twMerge(
                      clsx(
                        "flex h-[2.9rem] w-[3.4rem] items-center justify-center rounded-[0.5rem] text-[2.2rem] transition-colors duration-100 ease-linear",
                        "outline-none focus-visible:relative focus-visible:z-[2] focus-visible:shadow-focus",
                        "data-[selected=true]:bg-(--color-surface-muted)",
                      ),
                    )}
                    data-selected={isHighlighted ? "true" : undefined}
                    onClick={() => {
                      onSelect(emoji ?? id);
                    }}
                    onPointerMove={() => {
                      if (
                        highlightedEntry != null &&
                        highlightedEntry[0] === ci &&
                        highlightedEntry[1] === i
                      )
                        return;

                      setHighlightedEntry([ci, i]);
                    }}
                  >
                    {emoji ?? (
                      <img
                        src={url}
                        alt={id}
                        className="mx-auto block h-[2.2rem] w-[2.2rem]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiPickerTrigger;
