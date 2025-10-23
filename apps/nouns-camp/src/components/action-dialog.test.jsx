import React from "react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { renderWithProviders, screen, waitFor } from "@/test/test-utils";
import ActionDialog from "./action-dialog";
import { knownAddresses } from "@/test/treasury-fixtures";

vi.mock("@/hooks/public-client", () => ({
  __esModule: true,
  default: () => ({
    readContract: vi.fn().mockResolvedValue(knownAddresses.executor),
  }),
}));

vi.mock("@/hooks/eth-to-usd-rate", () => ({
  __esModule: true,
  default: () => 2000,
  Provider: ({ children }) => <>{children}</>,
}));

vi.mock("@/components/address-input", () => ({
  __esModule: true,
  default: ({ label, value, onChange, hint }) => (
    <div>
      <label>
        {label}
        <input
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0x..."
        />
      </label>
      {hint != null && <small>{hint}</small>}
    </div>
  ),
}));

vi.mock("@/components/noun-avatar", () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock("@/hooks/token-contract", () => ({
  __esModule: true,
  useTotalSupply: () => 0,
}));

vi.mock("@/nouns-subgraph", () => ({
  __esModule: true,
  subgraphFetch: vi.fn().mockResolvedValue({ nouns: [] }),
}));

vi.mock("@shades/ui-web/dialog", () => ({
  __esModule: true,
  default: ({ isOpen, children }) => (isOpen ? <div>{children({})}</div> : null),
}));

describe("ActionDialog currency selection", () => {
  it("includes WETH and renders conversions", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <ActionDialog
        isOpen
        close={() => {}}
        title="Add action"
        submit={() => {}}
        submitButtonLabel="Add"
      />,
    );

    const currencyTrigger = screen.getByRole("button", {
      name: /currency token/i,
    });

    await user.click(currencyTrigger);
    const wethOption = await screen.findByRole("option", { name: "WETH" });
    expect(wethOption).toBeVisible();
    await user.click(wethOption);

    const amountInput = screen.getByLabelText("Amount");
    await user.clear(amountInput);
    await user.type(amountInput, "1.5");

    const receiverInput = screen.getByLabelText("Receiver account");
    await user.clear(receiverInput);
    await user.type(receiverInput, knownAddresses.executor);

    await waitFor(() => {
      expect(
        screen.getByText(/≈\s*3,000\.00\s*USD/i),
      ).toBeVisible();
    });

    await user.click(currencyTrigger);
    const stethOption = await screen.findByRole("option", { name: "stETH" });
    await user.click(stethOption);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /steth/i }),
      ).toBeVisible();
    });
  });
});

