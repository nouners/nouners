"use client";

import React from "react";
import clsx from "clsx";
import config from "@/config";
import useSetting from "@/hooks/setting";
import { useTheme } from "@/theme-provider";

const SnowOverlay = React.lazy(() => import("@/snow"));

const ZOOM_FONT_SIZES = {
  tiny: "0.546875em",
  small: "0.5859375em",
  large: "0.6640625em",
  huge: "0.703125em",
};

const GlobalStyles = ({ children }) => {
  const theme = useTheme();
  const [zoomSetting] = useSetting("zoom");
  const [xmasEffectsOptOut] = useSetting("xmas-effects-opt-out");

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    const previous = root.style.colorScheme;
    const colorScheme = theme.colorScheme ?? "light";
    root.style.colorScheme = colorScheme;
    return () => {
      root.style.colorScheme = previous;
    };
  }, [theme]);

  React.useEffect(() => {
    const root = document.documentElement;
    const zoomSize = ZOOM_FONT_SIZES[zoomSetting];
    if (zoomSize) {
      root.style.fontSize = zoomSize;
    } else {
      root.style.removeProperty("font-size");
    }
  }, [zoomSetting]);

  return (
    <div
      className={clsx(
        "min-h-full min-w-full bg-(--color-surface-primary) text-text-normal",
        "transition-opacity duration-100 ease-out",
      )}
      style={{ opacity: isClient ? 1 : 0 }}
    >
      {children}
      {config["xmas-effects"] && !xmasEffectsOptOut && <SnowOverlay />}
    </div>
  );
};

export default function GlobalStylesWrapper({ children }) {
  return <GlobalStyles>{children}</GlobalStyles>;
}
