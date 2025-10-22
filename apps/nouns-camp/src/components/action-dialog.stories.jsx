import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import ActionDialog from "./action-dialog";

export default {
  title: "Camp/Action Dialog",
  component: ActionDialog,
  parameters: { layout: "fullscreen" },
};

const config = createConfig({
  ssr: false,
  chains: [mainnet],
  transports: {
    [mainnet.id]: http("https://cloudflare-eth.com"),
  },
});

const StoryProviders = ({ children }) => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};

const noop = () => {};

const Template = (args) => (
  <StoryProviders>
    <ActionDialog
      {...args}
      isOpen
      close={noop}
      submit={noop}
      submitButtonLabel="Save"
    />
  </StoryProviders>
);

export const OneTimeWethTransfer = Template.bind({});
OneTimeWethTransfer.args = {
  title: "One-time transfer",
  action: {
    type: "one-time-payment",
    amount: "1.5",
    currency: "weth",
    target: "0x0000000000000000000000000000000000000001",
  },
};
