import { NextResponse } from "next/server";
import { FARCASTER_ENABLED } from "@/constants/features";

export const ensureFarcasterEnabled = () => {
  if (FARCASTER_ENABLED) return null;
  return NextResponse.json(
    { error: "Farcaster features are temporarily disabled." },
    { status: 503 },
  );
};
