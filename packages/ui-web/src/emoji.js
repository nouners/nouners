import React from "react";
import clsx from "clsx";
import { emoji as emojiUtils } from "@shades/common/utils";
import { useEmojiById } from "@shades/common/app";
import { twMerge } from "tailwind-merge";

const Emoji = React.forwardRef(
  ({ large, emoji, children, className, style, ...props }, ref) => {
    const emojiItem = useEmojiById(emoji);
    const isPictogram = emojiItem?.emoji != null || emojiUtils.isEmoji(emoji);

    const dimension = large ? "calc(1.46668em * 1.45)" : "1.46668em";

    return (
      <span
        ref={ref}
        data-size={large ? "large" : undefined}
        className={twMerge(
          clsx(
            "group/emoji inline-flex h-[var(--emoji-size)] w-[var(--emoji-size)] overflow-hidden align-bottom",
          ),
          className,
        )}
        style={{ "--emoji-size": dimension, ...style }}
        {...props}
      >
        <span className="flex h-full w-full items-center justify-center text-[1.3em] group-data-[size=large]/emoji:text-[2em]">
          {isPictogram ? (
            emoji
          ) : emojiItem?.url != null ? (
            <img
              src={emojiItem.url}
              loading="lazy"
              className="h-[1em] w-[1em] rounded-[0.3rem] object-cover"
            />
          ) : (
            <div className="h-[1em] w-[1em] rounded-[0.3rem] bg-(--color-surface-muted)" />
          )}
        </span>
        {children}
      </span>
    );
  },
);

Emoji.displayName = "Emoji";

export default Emoji;
