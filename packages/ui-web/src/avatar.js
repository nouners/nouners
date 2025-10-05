import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const Avatar = React.forwardRef(
  (
    {
      url,
      signature,
      signatureLength = 1,
      signatureFontSize,
      size = "2rem",
      borderRadius,
      background,
      isLoading,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const baseStyle = {
      width: size,
      height: size,
      borderRadius: borderRadius ?? "var(--avatar-radius)",
      background: background ?? "var(--avatar-background)",
      ...style,
    };

    if (url != null) {
      return (
        <img
          ref={ref}
          data-avatar
          src={url}
          loading="lazy"
          className={twMerge(clsx("block object-cover"), className)}
          style={baseStyle}
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        data-avatar
        className={twMerge(
          clsx(
            "relative flex items-center justify-center text-text-dimmed uppercase",
            "select-none",
          ),
          className,
        )}
        style={baseStyle}
        {...props}
      >
        {!isLoading && signature != null && (
          <div
            className="absolute inset-0 flex items-center justify-center text-[var(--signature-size,1.1rem)] leading-none"
            style={{ "--signature-size": signatureFontSize }}
          >
            {[...String(signature)].slice(0, signatureLength)}
          </div>
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";

export default Avatar;
