"use client";

import React from "react";
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import usePreferredTheme from "@/hooks/preferred-theme";

const ThemeContext = React.createContext(null);

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context == null) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export default function ThemeProvider({ children }) {
  const theme = usePreferredTheme();
  const value = React.useMemo(() => theme, [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>
    </ThemeContext.Provider>
  );
}
