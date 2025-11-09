import { createPublicClient, http } from "viem";
import { object as objectUtils } from "@shades/common/utils";
import { CHAIN_ID } from "@/constants/env";
import { resolveIdentifier as resolveContractIdentifier } from "@/contracts";
import { getChain } from "@/utils/chains";
import { getJsonRpcUrl } from "@/wagmi-config";

const ONE_HOUR_IN_SECONDS = 60 * 60;

const chain = getChain(CHAIN_ID);

const publicClient = createPublicClient({
  chain,
  transport: http(getJsonRpcUrl(chain.id)),
});

const mainnetPublicClient =
  CHAIN_ID === 1
    ? publicClient
    : createPublicClient({
        chain,
        transport: http(getJsonRpcUrl(1)),
      });

const balanceOf = ({ contract, account }) => {
  const address = resolveContractIdentifier(contract)?.address;
  if (address == null) return BigInt(0);
  return publicClient.readContract({
    address,
    chainId: CHAIN_ID,
    abi: [
      {
        type: "function",
        name: "balanceOf",
        inputs: [{ type: "address" }],
        outputs: [{ type: "uint256" }],
      },
    ],
    functionName: "balanceOf",
    args: [account],
  });
};

export async function GET() {
  const executorAddress = resolveContractIdentifier("executor")?.address;
  const daoProxyAddress = resolveContractIdentifier("dao")?.address;
  const clientIncentivesRewardsProxyAddress = resolveContractIdentifier(
    "client-incentives-rewards-proxy",
  )?.address;
  const forkEscrowAddress = resolveContractIdentifier("fork-escrow")?.address;
  const tokenBuyerAddress = resolveContractIdentifier("token-buyer")?.address;
  const payerAddress = resolveContractIdentifier("payer")?.address;

  const {
    executorBalances,
    daoProxyEthBalance,
    tokenBuyerEthBalance,
    clientIncentivesRewardsProxyWethBalance,
    payerUsdcBalance,
    forkEscrowNounsBalance,
    convertionRates,
    lidoApr,
    rocketPoolApr,
    mantleApr,
  } = Object.fromEntries(
    await Promise.all([
      (async () => {
        const balances = Object.fromEntries(
          await Promise.all([
            publicClient
              .getBalance({ address: executorAddress })
              .then((balance) => ["eth", balance]),
            ...[
              { key: "weth", contract: "weth-token" },
              { key: "usdc", contract: "usdc-token" },
              { key: "steth", contract: "steth-token" },
              { key: "wsteth", contract: "wsteth-token" },
              { key: "meth", contract: "meth-token" },
              CHAIN_ID === 1 ? { key: "reth", contract: "reth-token" } : null,
              { key: "nouns", contract: "token" },
            ]
              .filter(Boolean)
              .map(async ({ key, contract }) => {
                const balance = await balanceOf({
                  contract,
                  account: executorAddress,
                });
                return [key, balance];
              }),
          ]),
        );
        return ["executorBalances", balances];
      })(),
      ...[
        { key: "daoProxyEthBalance", address: daoProxyAddress },
        { key: "tokenBuyerEthBalance", address: tokenBuyerAddress },
      ].map(async ({ key, address }) => {
        const balance = await publicClient.getBalance({
          address,
        });
        return [key, balance];
      }),
      ...[
        CHAIN_ID === 1
          ? {
              key: "clientIncentivesRewardsProxyWethBalance",
              contract: "weth-token",
              address: clientIncentivesRewardsProxyAddress,
            }
          : null,
        {
          key: "payerUsdcBalance",
          contract: "usdc-token",
          address: payerAddress,
        },
        {
          key: "forkEscrowNounsBalance",
          contract: "token",
          address: forkEscrowAddress,
        },
      ]
        .filter(Boolean)
        .map(async ({ key, contract, address }) => {
          const balance = await balanceOf({ contract, account: address });
          return [key, balance];
        }),
      (async () => {
        const [rethEth, usdcEth] = await Promise.all(
          [
            "chainlink-reth-eth-price-feed",
            "chainlink-usdc-eth-price-feed",
          ].map((contractIdentifier) =>
            mainnetPublicClient.readContract({
              address: resolveContractIdentifier(contractIdentifier, {
                chainId: 1,
              }).address,
              // chainId: 1,
              abi: [
                {
                  type: "function",
                  name: "latestAnswer",
                  inputs: [],
                  outputs: [{ type: "int256" }],
                },
              ],
              functionName: "latestAnswer",
            }),
          ),
        );
        return ["convertionRates", { rethEth, usdcEth }];
      })(),
      (async () => {
        const res = await fetch(
          "https://eth-api.lido.fi/v1/protocol/steth/apr/sma",
        );
        if (!res.ok) throw new Error("Failed to fetch Lido APR data");
        const { data } = await res.json();
        return ["lidoApr", data.smaApr / 100];
      })(),
      (async () => {
        const res = await fetch(
          "https://api.rocketpool.net/api/mainnet/payload",
        );
        if (!res.ok) throw new Error("Failed to fetch Rocket Pool APR data");
        const { rethAPR } = await res.json();
        return ["rocketPoolApr", Number(rethAPR) / 100];
      })(),
      (async () => {
        try {
          const res = await fetch("https://app.methprotocol.xyz/api/stats/apy");
          if (!res.ok) throw new Error("Failed to fetch Mantle mETH APR data");
          const payload = await res.json();
          const entry = Array.isArray(payload?.data) ? payload.data[0] : null;
          const aprValue =
            entry?.OneDayAPY ?? entry?.WeekAPY ?? entry?.MonthAPY ?? null;
          const normalizedApr =
            aprValue == null ? null : Number.parseFloat(aprValue);
          return [
            "mantleApr",
            normalizedApr != null && Number.isFinite(normalizedApr)
              ? normalizedApr
              : null,
          ];
        } catch (e) {
          console.error("Failed to fetch mETH APR", e);
          return ["mantleApr", null];
        }
      })(),
    ]),
  );

  // 30 min cache
  const cacheTime = ONE_HOUR_IN_SECONDS / 2;

  return Response.json(
    {
      balances: {
        executor: objectUtils.mapValues(
          (v) => v?.toString() ?? null,
          executorBalances,
        ),
        "dao-proxy": { eth: daoProxyEthBalance.toString() },
        "client-incentives-rewards-proxy": {
          weth: clientIncentivesRewardsProxyWethBalance?.toString() ?? null,
        },
        "token-buyer": { eth: tokenBuyerEthBalance.toString() },
        payer: { usdc: payerUsdcBalance.toString() },
        "fork-escrow": { nouns: forkEscrowNounsBalance.toString() },
      },
      rates: objectUtils.mapValues((v) => v.toString(), convertionRates),
      aprs: { lido: lidoApr, rocketPool: rocketPoolApr, mantle: mantleApr },
    },
    {
      headers: {
        "Cache-Control": `max-age=${cacheTime}, s-maxage=${cacheTime}, stale-while-revalidate=${cacheTime * 2}`,
      },
    },
  );
}
