import { resolveIdentifier } from "../contracts.js";

const toLowerAddress = (identifier) =>
  resolveIdentifier(identifier)?.address?.toLowerCase();

const withTokenMeta = (identifier, currency, { decimals }) => {
  const contract = resolveIdentifier(`${identifier}-token`);
  return {
    identifier: `${identifier}-token`,
    currency,
    decimals,
    address: contract?.address?.toLowerCase(),
    name: contract?.name ?? contract?.token ?? currency.toUpperCase(),
    symbol: contract?.token ?? currency.toUpperCase(),
  };
};

export const treasuryTokenFixtures = {
  weth: withTokenMeta("weth", "weth", { decimals: 18 }),
  steth: withTokenMeta("steth", "steth", { decimals: 18 }),
};

export const knownAddresses = {
  executor: toLowerAddress("executor"),
  payer: toLowerAddress("payer"),
  tokenBuyer: toLowerAddress("token-buyer"),
};

export const impersonationAccount = toLowerAddress("executor");

export const truncateAddress = (address) =>
  address == null ? "" : `${address.slice(0, 6)}...${address.slice(-4)}`;

export const decimalsByCurrency = {
  weth: treasuryTokenFixtures.weth.decimals,
  steth: treasuryTokenFixtures.steth.decimals,
};

