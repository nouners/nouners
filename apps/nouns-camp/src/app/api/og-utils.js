import { isAddress as isEthereumAccountAddress } from "viem";
import { ethereum as ethereumUtils } from "@shades/common/utils";

const { truncateAddress } = ethereumUtils;

export const getFonts = async (request) => {
  const fontName = "Oxanium";

  const semiBoldResp = await fetch(
    new URL("/assets/fonts/Oxanium-SemiBold.ttf", request.url),
  );
  const semiBoldFontArray = await semiBoldResp.arrayBuffer();

  const boldResp = await fetch(
    new URL("/assets/fonts/Oxanium-Bold.ttf", request.url),
  );
  const boldFontArray = await boldResp.arrayBuffer();

  return [
    {
      data: semiBoldFontArray,
      name: fontName,
      weight: 400,
      style: "normal",
    },
    {
      data: boldFontArray,
      name: fontName,
      weight: 700,
      style: "normal",
    },
  ];
};

export const formatDate = ({ value, ...options }) => {
  if (!value) return null;
  const formatter = new Intl.DateTimeFormat(undefined, options);
  return formatter.format(
    typeof value === "string" ? parseFloat(value) : value,
  );
};

export const displayName = ({ address, ensName }) => {
  const isAddress = address != null && isEthereumAccountAddress(address);
  const truncatedAddress = isAddress ? truncateAddress(address) : null;
  return ensName ?? truncatedAddress;
};
