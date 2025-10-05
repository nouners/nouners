import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const Image = ({ disableFallback = false, className, style, ...rest }) => {
  const ref = React.useRef();
  const onLoadRef = React.useRef(rest.onLoad);

  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    setError(null);
    if (ref.current == null) return;
    ref.current.onerror = (event) => {
      setError(event);
    };
  }, [rest.src]);

  React.useEffect(() => {
    onLoadRef.current = rest.onLoad;
  });

  React.useEffect(() => {
    if (ref.current == null) return;
    ref.current.onload = () => {
      if (ref.current == null) return;
      onLoadRef.current?.({
        width: ref.current.naturalWidth,
        height: ref.current.naturalHeight,
      });
    };
  }, []);

  if (error != null && !disableFallback) {
    return (
      <span
        data-url={rest.src ?? "--none--"}
        style={{
          padding: rest.width == null ? "1em" : 0,
          width: rest.width,
          ...style,
        }}
        className={twMerge(
          clsx(
            "inline-flex items-center justify-center text-text-muted text-base",
            "rounded-md border border-(--color-border-lighter)",
            "select-none",
          ),
          className,
        )}
      >
        Error loading image
      </span>
    );
  }

  return <img ref={ref} className={className} style={style} {...rest} />;
};

export default Image;
