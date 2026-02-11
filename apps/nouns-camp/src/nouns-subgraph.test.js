import { describe, expect, test } from "vitest";
import { parseFeedbackPost, parseProposalVote } from "@/nouns-subgraph";

describe("nouns subgraph parsing", () => {
  test("parseFeedbackPost unwraps wrapped markdown", () => {
    const wrappedReason = "First line of text\ncontinues on next line";

    const parsed = parseFeedbackPost({
      id: "0xabc-1",
      createdBlock: "1",
      createdTimestamp: "1700000000",
      supportDetailed: 0,
      votes: "1",
      reason: wrappedReason,
      voter: { id: "0x123" },
      proposal: { id: "42" },
      candidate: null,
    });

    expect(parsed.reason).toBe("First line of text continues on next line");
  });

  test("parseProposalVote unwraps wrapped markdown", () => {
    const wrappedReason = [
      "Paragraph line one",
      "line two",
      "",
      "Second paragraph",
      "continues",
    ].join("\n");

    const parsed = parseProposalVote({
      id: "vote-1",
      blockNumber: "10",
      blockTimestamp: "1700000001",
      transactionHash: "0xhash",
      reason: wrappedReason,
      supportDetailed: 1,
      votes: "3",
      voter: { id: "0xabc" },
      proposal: { id: "101" },
      clientId: "0",
    });

    expect(parsed.reason).toBe(
      ["Paragraph line one line two", "", "Second paragraph continues"].join(
        "\n",
      ),
    );
  });
});
