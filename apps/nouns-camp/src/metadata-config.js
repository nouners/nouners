import { APP_HOST } from "@/constants/env";

export default {
  viewportLightThemeColor: "#ffffff",
  viewportDarkThemeColor: "hsl(0 0% 10%)",
  appTitle: "Nouners",
  appDescription: "A Nouns governance client",
  titleTemplate: "%s - Nouners",
  canonicalAppBasename: `https://${APP_HOST}`,
  openGraphType: "website",
  openGraphSiteName: APP_HOST,
  twitterCard: "summary",
  appleWebAppStatusBarStyle: "default",
  // Farcaster miniapp configuration
  miniappName: "Nouners",
  miniappButtonTitle: "🏛️ Open",
  miniappSplashBackgroundColor: "#f1f0e5", // matches light theme backgroundPrimary
};
