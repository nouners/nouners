import { test, expect } from "@playwright/test";
import { parseUnits } from "viem";

import {
  impersonationAccount,
  knownAddresses,
  treasuryTokenFixtures,
  truncateAddress,
} from "../test/treasury-fixtures.js";

const buildImpersonatedUrl = (path = "/new") =>
  `${path}?impersonate=${impersonationAccount}`;

test.describe("proposal editor payments", () => {
  test("drafting WETH and stETH payments shows previews and transactions", async ({
    page,
  }) => {
    await page.goto(buildImpersonatedUrl());

    await expect(
      page.getByRole("button", { name: /add a proposal action/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /add a proposal action/i }).click();

    const currencyTrigger = page.getByRole("button", { name: /currency token/i });
    await currencyTrigger.click();
    await page.getByRole("option", { name: "WETH" }).click();

    await page.getByLabel("Amount").fill("1.25");
    await page
      .getByLabel("Receiver account")
      .fill(knownAddresses.tokenBuyer ?? "");

    await page.getByRole("button", { name: "Add" }).click();

    const recipientTruncated = truncateAddress(knownAddresses.tokenBuyer ?? "");
    await expect(
      page.getByText(new RegExp(`Transfer\\s+1.25\\s+WETH\\s+to\\s+${recipientTruncated}`)),
    ).toBeVisible();

    await page.getByRole("button", { name: /show transaction/i }).first().click();

    const wethList = page.locator("ul[data-transaction-list]").first();
    await expect(wethList).toContainText(
      truncateAddress(treasuryTokenFixtures.weth.address ?? ""),
    );
    const wethAmount = parseUnits("1.25", treasuryTokenFixtures.weth.decimals).toString();
    await expect(wethList).toContainText(wethAmount);

    await page.getByRole("button", { name: /add action/i }).click();

    await page
      .getByRole("button", { name: /currency token/i })
      .click();
    await page.getByRole("option", { name: "stETH" }).click();
    await page.getByLabel("Amount").fill("2.5");
    await page
      .getByLabel("Receiver account")
      .fill(knownAddresses.executor ?? "");

    await page.getByRole("button", { name: "Add" }).click();

    const executorTruncated = truncateAddress(knownAddresses.executor ?? "");
    await expect(
      page.getByText(
        new RegExp(`Transfer\\s+2.5\\s+stETH\\s+to\\s+${executorTruncated}`, "i"),
      ),
    ).toBeVisible();

    await page.getByRole("button", { name: /show transaction/i }).nth(1).click();
    const stethList = page.locator("ul[data-transaction-list]").nth(1);
    await expect(stethList).toContainText(
      truncateAddress(treasuryTokenFixtures.steth.address ?? ""),
    );
    const stethAmount = parseUnits("2.5", treasuryTokenFixtures.steth.decimals).toString();
    await expect(stethList).toContainText(stethAmount);
  });
});

