import { describe, it, expect } from "vitest";
import { encodeAbiParameters, parseUnits } from "viem";

import {
  buildActions,
  parse,
  resolveAction,
  unparse,
  isEqual,
} from "./transactions";
import {
  decimalsByCurrency,
  knownAddresses,
  treasuryTokenFixtures,
} from "@/test/treasury-fixtures";

const buildProposalData = ({ target, signature, calldata, value = 0n }) => ({
  targets: [target],
  signatures: [signature],
  calldatas: [calldata],
  values: [value.toString()],
});

describe("transactions treasury token flows", () => {
  const recipient = knownAddresses.tokenBuyer;
  if (recipient == null) throw new Error("Token buyer address fixture missing");

  it("parses, aggregates, and resolves stETH transfers", () => {
    const { address, decimals } = treasuryTokenFixtures.steth;
    if (address == null) throw new Error("stETH token address fixture missing");

    const amountHuman = "5.5";
    const amount = parseUnits(amountHuman, decimals);
    const calldata = encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }],
      [recipient, amount],
    );

    const original = buildProposalData({
      target: address,
      signature: "transfer(address,uint256)",
      calldata,
      value: 0n,
    });

    const parsed = parse(original);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      type: "steth-transfer",
      receiverAddress: recipient,
      stethAmount: amount,
    });

    const actions = buildActions(parsed);
    expect(actions).toEqual([
      {
        type: "one-time-payment",
        target: recipient,
        currency: "steth",
        amount: amountHuman,
        firstTransactionIndex: 0,
      },
    ]);

    const resolved = resolveAction(actions[0]);
    expect(resolved).toEqual(parsed);

    const roundTripped = unparse(resolved);
    expect(isEqual(roundTripped, original)).toBe(true);
  });

  it("parses, aggregates, and resolves WETH transfers", () => {
    const { address, decimals } = treasuryTokenFixtures.weth;
    if (address == null) throw new Error("WETH token address fixture missing");

    const amountHuman = "1.25";
    const amount = parseUnits(amountHuman, decimalsByCurrency.weth ?? decimals);
    const calldata = encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }],
      [recipient, amount],
    );

    const original = buildProposalData({
      target: address,
      signature: "transfer(address,uint256)",
      calldata,
      value: 0n,
    });

    const parsed = parse(original);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      type: "weth-transfer",
      receiverAddress: recipient,
      wethAmount: amount,
    });

    const actions = buildActions(parsed);
    expect(actions).toEqual([
      {
        type: "one-time-payment",
        target: recipient,
        currency: "weth",
        amount: amountHuman,
        firstTransactionIndex: 0,
      },
    ]);

    const resolved = resolveAction(actions[0]);
    expect(resolved).toEqual(parsed);

    const roundTripped = unparse(resolved);
    expect(isEqual(roundTripped, original)).toBe(true);
  });
});

