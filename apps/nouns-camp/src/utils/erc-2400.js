export const createUri = (chainId, transactionHash) => {
  if (chainId == null || transactionHash == null)
    throw new Error("ERC-2400 URI requires chainId and transaction hash");
  const uri = `ethereum:tx-${transactionHash}`;
  if (String(chainId) === "1") return uri;
  return uri + `@${chainId}`;
};
