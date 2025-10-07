import { CHAIN_ID } from "@/constants/env";
import { getTheme } from "@/theme";
import { getChain } from "@/utils/chains";
import { getJsonRpcUrl } from "@/wagmi-config";
import { createPublicClient, http } from "viem";
import { displayName, formatDate, getFonts } from "@/app/api/og-utils";
import { ImageResponse } from "next/og";
import {
  CANDIDATE_FEEDBACK_FIELDS,
  parseFeedbackPost,
  parseProposalVote,
  PROPOSAL_FEEDBACK_FIELDS,
  subgraphFetch,
  VOTE_FIELDS,
} from "@/nouns-subgraph";

// export const runtime = "edge";

const theme = getTheme("light");

const chain = getChain(CHAIN_ID);
const publicClient = createPublicClient({
  chain,
  transport: http(getJsonRpcUrl(chain.id)),
  batch: {
    multicall: {
      wait: 250,
    },
  },
});

const fetchVoteOrFeedbackPost = async (id) => {
  const data = await subgraphFetch({
    query: `
      ${VOTE_FIELDS}
      ${CANDIDATE_FEEDBACK_FIELDS}
      ${PROPOSAL_FEEDBACK_FIELDS}
      query {
        vote(id: "${id}") {
          ...VoteFields
        }

        proposalFeedback(id: "${id}") {
          ...ProposalFeedbackFields
        }

        candidateFeedback(id: "${id}") {
          ...CandidateFeedbackFields
        }
      }`,
  });

  const { vote, proposalFeedback, candidateFeedback } = data;

  if (vote) return parseProposalVote(vote);
  if (proposalFeedback) return parseFeedbackPost(proposalFeedback);
  if (candidateFeedback) return parseFeedbackPost(candidateFeedback);

  return null;
};

const Signal = ({ positive, negative, ...props }) => (
  <span
    style={{
      whiteSpace: "pre",
      fontWeight: theme.text.weights.emphasis,
      color: positive
        ? theme.colors.textPositive
        : negative
          ? theme.colors.textNegative
          : theme.colors.textDimmed,
    }}
    {...props}
  />
);

export async function GET(request) {
  const fonts = await getFonts(request);

  const { searchParams } = new URL(request.url);
  const voteOrFeedbackId = searchParams.get("id");
  const ratio = searchParams.get("ratio") || "og"; // "og" for 1.91:1, "miniapp" for 3:2

  const voteOrFeedback = await fetchVoteOrFeedbackPost(voteOrFeedbackId);

  if (!voteOrFeedback) {
    return new Response(
      `Vote or signal with id '${voteOrFeedbackId}' not found`,
      {
        status: 404,
      },
    );
  }

  const ensName = await publicClient.getEnsName({
    address: voteOrFeedback.voterId,
  });

  const signalWord = (() => {
    switch (voteOrFeedback.type) {
      case "vote":
        return "voted";
      case "feedback-post": {
        if (voteOrFeedback.support !== 2) return "signaled";
        return "commented";
      }
      default:
        throw new Error();
    }
  })();

  const voteDate = formatDate({
    value: voteOrFeedback.createdTimestamp,
    day: "numeric",
    month: "short",
    year:
      voteOrFeedback.createdTimestamp.getYear() !== new Date().getYear()
        ? "numeric"
        : undefined,
    hour: "numeric",
    hour12: false,
    minute: "numeric",
    timeZone: "UTC",
    timeZoneName: "short",
  });

  // Image dimensions based on ratio
  const dimensions = ratio === "miniapp"
    ? { width: 900, height: 600, padding: "2.5rem 1.5rem", fontSize: theme.text.sizes.base }
    : { width: 1200, height: 628, padding: "3rem 2rem", fontSize: theme.text.sizes.large };

  return new ImageResponse(
    (
      <div
        id="imageResponse"
        style={{
          backgroundColor: theme.colors.backgroundPrimary,
          backgroundSize: "150px 150px",
          padding: dimensions.padding,
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: theme.colors.textNormal,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                whiteSpace: "pre",
                fontWeight: theme.text.weights.emphasis,
                fontSize: dimensions.fontSize,
              }}
            >
              {displayName({ address: voteOrFeedback.voterId, ensName })}{" "}
              {(() => {
                switch (voteOrFeedback.support) {
                  case 0:
                    return (
                      <Signal negative>
                        {signalWord} against
                        {voteOrFeedback.votes != null && (
                          <> ({voteOrFeedback.votes})</>
                        )}
                      </Signal>
                    );
                  case 1:
                    return (
                      <Signal positive>
                        {signalWord} for
                        {voteOrFeedback.votes != null && (
                          <> ({voteOrFeedback.votes})</>
                        )}
                      </Signal>
                    );
                  case 2:
                    return voteOrFeedback.type === "vote" ? (
                      <Signal>
                        abstained
                        {voteOrFeedback.votes != null && (
                          <> ({voteOrFeedback.votes})</>
                        )}
                      </Signal>
                    ) : (
                      <>{signalWord} on</>
                    );
                }
              })()}
            </div>

            <div
              style={{
                color: theme.colors.textDimmed,
                fontSize: theme.text.sizes.small,
              }}
            >
              {voteDate}
            </div>
          </div>

          <div
            style={{
              display: "block",
              whiteSpace: "pre-line",
              lineHeight: 1.5,
              fontSize: dimensions.fontSize,
              lineClamp: '7 "[...]"',
              overflow: "hidden",
            }}
          >
            {voteOrFeedback.reason}
          </div>
        </div>
      </div>
    ),
    {
      // debug: true,
      width: dimensions.width,
      height: dimensions.height,
      emoji: "twemoji",
      fonts,
    },
  );
}
