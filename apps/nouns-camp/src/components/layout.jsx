import React from "react";
import clsx from "clsx";
import NextLink from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { invariant } from "@shades/common/utils";
import { useMatchMedia } from "@shades/common/react";
import Button from "@shades/ui-web/button";
import * as DropdownMenu from "@shades/ui-web/dropdown-menu";
import {
  CaretDown as CaretDownIcon,
  DotsHorizontal as DotsIcon,
  ChatBubbles as ChatBubblesIcon,
  Document as DocumentIcon,
} from "@shades/ui-web/icons";
import { CHAIN_ID } from "@/constants/env";
import {
  getChain as getSupportedChain,
  isTestnet as isTestnetChain,
} from "@/utils/chains";
import { useAccount, useAccountStreams, useDelegate } from "@/store";
import { useNavigate } from "@/hooks/navigation";
import { useWallet, useWalletAuthentication } from "@/hooks/wallet";
import {
  useState as useSessionState,
  useActions as useSessionActions,
} from "@/session-provider";
import { useDialog } from "@/hooks/global-dialogs";
import { useConnectedFarcasterAccounts } from "@/hooks/farcaster";
import useAccountDisplayName from "@/hooks/account-display-name";
import {
  useAuctionData,
  useLazySeed,
  useNounImageDataUri,
} from "@/components/auction-dialog";
import AccountAvatar from "@/components/account-avatar";
import LogoSymbol from "@/components/logo-symbol";
import { formatEther } from "viem";
import useTreasuryData from "@/hooks/treasury-data";
import useEnsName from "@/hooks/ens-name";

const NAV_LINK_BASE_CLASS = clsx(
  "inline-block h-(2.8rem) min-w-(2.8rem)",
  "overflow-hidden text-ellipsis no-underline",
  "rounded-[0.6rem] px-(0.5rem) py-(0.3rem)",
  "text-base text-text-normal",
  "transition-colors duration-100 ease-linear",
  "hover:bg-(--color-surface-muted) hover:cursor-pointer",
  "data-[index='0']:inline-flex data-[index='0']:items-center data-[index='0']:min-w-max",
  "data-[disabled=true]:pointer-events-none",
);

const Layout = ({
  scrollContainerRef,
  navigationStack = [],
  actions,
  scrollView = true,
  children,
  ...props
}) => (
  <div
    className="relative z-0 flex h-full min-h-full min-w-[min(30.6rem,100vw)] flex-1 flex-col bg-surface-primary text-text-normal"
    {...props}
  >
    <NavBar navigationStack={navigationStack} actions={actions} />
    {scrollView ? (
      <div className="relative flex flex-1 min-h-0 min-w-0">
        <div
          ref={scrollContainerRef}
          className="absolute inset-0 flex-1 overflow-y-scroll overflow-x-hidden [overflow-anchor:none]"
        >
          <main className="flex min-h-full flex-col items-stretch justify-start">
            {children}
          </main>
        </div>
      </div>
    ) : (
      <main className="flex flex-1 min-h-0 min-w-0">{children}</main>
    )}
  </div>
);

const TreasuryDialogTrigger = React.forwardRef((props, ref) => {
  const { open: openDialog, preload: preloadDialog } = useDialog("treasury");
  const data = useTreasuryData();

  React.useEffect(() => {
    preloadDialog();
  }, [preloadDialog]);

  return (
    <Button ref={ref} {...props} onClick={() => openDialog()}>
      <span data-desktop-only className="hidden sm:inline">
        Treasury
      </span>{" "}
      {data == null ? (
        "..."
      ) : (
        <>
          {"Ξ"}{" "}
          {Math.round(
            parseFloat(formatEther(data.totals.eth)),
          ).toLocaleString()}
        </>
      )}
    </Button>
  );
});

const AuctionDialogTrigger = React.forwardRef((props, ref) => {
  const { auction } = useAuctionData();
  const { open: openDialog, preload: preloadDialog } = useDialog("auction");

  React.useEffect(() => {
    preloadDialog();
  }, [preloadDialog]);

  return (
    <Button
      ref={ref}
      {...props}
      onClick={() => openDialog()}
      icon={
        <>
          <AuctionNounImage className="noun-image block size-(2.4rem) rounded-[0.4rem] bg-(--color-surface-strong)" />
          <svg
            className="progress-outline pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:[&>rect]:stroke-accent-primary group-focus-visible:[&>rect]:stroke-accent-primary"
            viewBox="0 0 32 32"
            style={{
              width: "calc(100% + 0.4rem)",
              height: "calc(100% + 0.4rem)",
            }}
          >
            <rect
              width="30"
              height="30"
              rx="7"
              x="1"
              y="1"
              pathLength="99"
              style={{
                fill: "none",
                stroke: "var(--color-accent-primary-soft)",
                strokeWidth: 2,
                strokeDasharray:
                  "calc(var(--progress) * 100) calc((1 - var(--progress)) * 100)",
                strokeDashoffset: -9,
                transition: "stroke-dashoffset 1s linear, stroke 0.1s ease-out",
              }}
            />
          </svg>
        </>
      }
      className={clsx(
        "group relative ml-(0.4rem) mr-(0.8rem) overflow-visible rounded-[0.6rem]",
        "focus-visible:shadow-none hover:bg-transparent",
      )}
      style={{
        "--progress": (() => {
          if (auction == null) return 0;
          const now = Date.now();
          const start = auction.startTimestamp.getTime();
          const end = auction.endTimestamp.getTime();
          const duration = end - start;
          const elapsed = Math.max(0, now - start);
          return elapsed / duration;
        })(),
      }}
    />
  );
});

const predefinedActions = {
  "create-menu": {
    key: "create-menu",
    type: "dropdown",
    label: "New",
    placement: "bottom start",
    desktopOnly: true,
    items: [
      {
        id: "-",
        children: [
          {
            id: "new-proposal",
            title: "Proposal",
            description: "Draft a new proposal or candidate",
            icon: (
              <DocumentIcon
                aria-hidden="true"
                role="graphics-symbol"
                className="h-auto w-(1.6rem)"
              />
            ),
          },
          {
            id: "new-discussion-topic",
            title: "Discussion topic",
            description: "Start a discussion thread (onchain)",
            icon: (
              <ChatBubblesIcon className="h-auto w-(1.6rem) translate-y-[1px]" />
            ),
          },
        ],
      },
    ],
    buttonProps: {
      iconRight: <CaretDownIcon className="h-auto w-(0.9rem)" />,
    },
  },
  "treasury-dialog-trigger": {
    key: "treasury-dialog-trigger",
    desktopOnly: true,
    component: TreasuryDialogTrigger,
  },
  "auction-dialog-trigger": {
    key: "auction-dialog-trigger",
    component: AuctionDialogTrigger,
  },
};

const resolvePredefinedAction = (actionId) => {
  invariant(
    predefinedActions[actionId] != null,
    `Unknown predefined action: ${actionId}`,
  );
  return predefinedActions[actionId];
};
const resolveAction = (action) => {
  if (typeof action !== "object") return resolvePredefinedAction(action);

  if (action.extends != null) {
    const baseAction = resolvePredefinedAction(action.extends);
    return { ...baseAction, ...action };
  }

  return action;
};

const defaultActionIds = [
  "create-menu",
  "treasury-dialog-trigger",
  "auction-dialog-trigger",
];

const NavBar = ({ navigationStack, actions: customActions }) => {
  const unresolvedActions = customActions ?? defaultActionIds;
  const searchParams = useSearchParams();

  const { open: openTreasuryDialog } = useDialog("treasury");
  const { open: openAccountDialog } = useDialog("account");
  const { open: openEditProfileDialog } = useDialog("profile-edit");
  const { open: openProposalDraftsDialog } = useDialog("drafts");
  const { open: openDelegationDialog } = useDialog("delegation");
  const { open: openStreamsDialog } = useDialog("streams");
  const { open: openSettingsDialog } = useDialog("settings");
  const { open: openAccountAuthenticationDialog } = useDialog(
    "account-authentication",
  );
  const { open: openFarcasterSetupDialog } = useDialog("farcaster-setup");

  const isDesktop = useMatchMedia("(min-width: 600px)");

  const actions = unresolvedActions
    .map(resolveAction)
    .filter((action) => isDesktop || !action.desktopOnly);

  const pathname = usePathname();
  const navigate = useNavigate();

  const {
    address: connectedWalletAccountAddress,
    chainId: connectedChainId,
    requestAccess: requestWalletAccess,
    disconnect: disconnectWallet,
    switchToTargetChain: switchWalletToTargetChain,
    isAuthenticated: isConnectedWalletAccountAuthenticated,
    isLoading: isLoadingWallet,
  } = useWallet();
  const ensName = useEnsName(connectedWalletAccountAddress);
  const { signIn: signInConnectedWalletAccount } = useWalletAuthentication();
  const { address: loggedInAccountAddress } = useSessionState();
  const { destroy: signOut } = useSessionActions();
  const connectedFarcasterAccounts = useConnectedFarcasterAccounts();
  const hasVerifiedFarcasterAccount = connectedFarcasterAccounts?.length > 0;
  const hasFarcasterAccountKey =
    hasVerifiedFarcasterAccount &&
    connectedFarcasterAccounts.some((a) => a.hasAccountKey);

  const userAccountAddress =
    connectedWalletAccountAddress ?? loggedInAccountAddress;

  const isTestnet = isTestnetChain(CHAIN_ID);
  const isConnectedToTargetChain = CHAIN_ID === connectedChainId;

  const chain = getSupportedChain(CHAIN_ID);

  const userAccount = useAccount(userAccountAddress);
  const userDelegate = useDelegate(userAccountAddress);

  const hasNouns = userAccount?.nouns?.length > 0;
  const hasVotingPower = userDelegate?.nounsRepresented?.length > 0;

  const userAccountDisplayName = useAccountDisplayName(userAccountAddress);

  const hasStreams =
    useAccountStreams(connectedWalletAccountAddress).length > 0;

  const handleDropDownAction = async (key) => {
    switch (key) {
      case "new-proposal":
        navigate("/new");
        break;
      case "new-discussion-topic":
        navigate("/new?topic=1");
        break;
      case "open-account-dialog":
        openAccountDialog();
        break;
      case "open-drafts-dialog":
        openProposalDraftsDialog();
        break;
      case "open-edit-profile-dialog":
        openEditProfileDialog();
        break;
      case "open-delegation-dialog":
        openDelegationDialog();
        break;
      case "open-streams-dialog":
        openStreamsDialog();
        break;
      case "copy-account-address":
        navigator.clipboard.writeText(userAccountAddress);
        break;
      case "open-warpcast":
        window.open("https://warpcast.com/~/channel/nouns", "_blank");
        break;
      case "open-flows":
        window.open("https://flows.wtf", "_blank");
        break;
      case "open-camp-changelog":
        window.open("https://warpcast.com/~/channel/camp", "_blank");
        break;
      case "open-camp-discord":
        window.open("https://discord.gg/kXjMV8kTnk", "_blank");
        break;
      case "open-camp-github":
        window.open(
          "https://github.com/obvious-inc/frontend-monorepo/tree/main/apps/nouns-camp",
          "_blank",
        );
        break;
      case "navigate-to-auction":
        navigate("/auction");
        break;
      case "navigate-to-proposal-listing":
        navigate("/proposals");
        break;
      case "navigate-to-candidate-listing":
        navigate("/candidates");
        break;
      case "navigate-to-topic-listing":
        navigate("/topics");
        break;
      case "navigate-to-account-listing":
        navigate("/voters");
        break;
      case "open-settings-dialog":
        openSettingsDialog();
        break;
      case "open-treasury-dialog":
        openTreasuryDialog();
        break;
      case "setup-farcaster":
        openFarcasterSetupDialog();
        break;
      case "sign-in": {
        try {
          openAccountAuthenticationDialog();
          await signInConnectedWalletAccount();
        } catch (e) {
          console.error(e);
          alert("Ops, seems like something went wrong!");
        }
        break;
      }
      case "sign-out": {
        try {
          await signOut();
          alert("You have been logged out");
        } catch (e) {
          console.error(e);
          alert("Ops, seems like something went wrong!");
        }
        break;
      }
      case "disconnect-wallet":
        disconnectWallet();
        break;
    }
  };

  const navigationItems = [
    (() => {
      const logo = (
        <LogoSymbol
          className="inline-block h-auto w-(1.8rem) [backface-visibility:hidden]"
          style={{ filter: isTestnet ? "invert(1)" : undefined }}
        />
      );

      if (pathname !== "/")
        return {
          to: "/",
          label: (
            <>
              {logo}
              <span className="hidden sm:ml-(0.6rem) sm:inline">
                {isTestnet ? chain.name : "Camp"}
              </span>
            </>
          ),
        };

      const isRoot = pathname === "/";
      const hasSearchParams = searchParams.size > 0;

      return {
        key: "root-logo",
        to: "/",
        replace: hasSearchParams && isRoot ? true : undefined,
        props: {
          className: "px-0 py-0",
          style: {
            perspective: "200vmax",
          },
        },
        label: (
          <>
            <div className="relative inline-flex h-(1.8rem) w-(1.8rem) items-center justify-center [transform-style:preserve-3d] animate-[flip-logo_24s_linear_12s_infinite] transition-transform duration-[0.25s] ease-out hover:animate-none [&>svg]:block">
              {logo}
              <div className="absolute left-1/2 top-1/2 h-(2.4rem) w-(2.4rem) -translate-x-1/2 -translate-y-1/2 [backface-visibility:hidden] [transform:translateX(-50%)_translateY(-50%)_rotate3d(0.4,1,0,180deg)] [&>svg]:block [&>svg]:h-full [&>svg]:w-full [&>svg]:rounded-[0.3rem]">
                <NoggleImage />
              </div>
            </div>
            {isTestnet && (
              <span className="hidden sm:ml-(0.6rem) sm:inline">
                {chain.name}
              </span>
            )}
          </>
        ),
      };
    })(),
    ...navigationStack,
  ];

  return (
    <nav className="flex min-h-[var(--size-navbar,4.7rem)] items-center justify-start whitespace-nowrap">
      <div className="flex min-w-0 flex-1 items-center gap-(0.2rem) overflow-hidden pl-(1.3rem) pr-(1.6rem) py-(1rem) sm:px-(1rem)">
        {navigationItems.map((item, index) => {
          const Component = item.component ?? NextLink;
          const baseProps =
            item.component != null
              ? (item.props ?? {})
              : {
                  prefetch: true,
                  href: item.to,
                };
          const resolvedProps = { ...baseProps };
          if (item.replace != null) resolvedProps.replace = item.replace;
          const { className: itemClassName, ...restComponentProps } =
            resolvedProps;

          return (
            <React.Fragment key={item.key ?? item.to ?? index}>
              {index > 0 && (
                <span
                  data-index={index}
                  data-desktop-only={item.desktopOnly}
                  className={clsx(
                    "text-base text-text-muted",
                    item.desktopOnly && "max-sm:hidden",
                  )}
                >
                  {"/"}
                </span>
              )}
              <Component
                {...restComponentProps}
                data-index={index}
                data-image={item.image || undefined}
                data-desktop-only={item.desktopOnly}
                className={clsx(
                  NAV_LINK_BASE_CLASS,
                  item.desktopOnly && "max-sm:hidden",
                  itemClassName,
                )}
              >
                {item.label}
              </Component>
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex items-center pl-0 pr-(1.6rem) text-base sm:px-(1rem)">
        <ul className="grid auto-cols-max grid-flow-col items-center gap-(0.3rem)">
          {[
            ...actions,
            actions.length > 0 && { type: "separator" },
            connectedWalletAccountAddress == null
              ? {
                  onSelect: () => {
                    requestWalletAccess();
                  },
                  buttonProps: {
                    variant: "default",
                    isLoading: requestWalletAccess == null || isLoadingWallet,
                    disabled: requestWalletAccess == null || isLoadingWallet,
                    className: "ml-(0.8rem) mr-(0.4rem)",
                  },
                  label: (
                    <>
                      Connect
                      <span data-desktop-only className="hidden sm:inline">
                        {" "}
                        Wallet
                      </span>
                    </>
                  ),
                }
              : !isConnectedToTargetChain
                ? {
                    onSelect: () => {
                      switchWalletToTargetChain();
                    },
                    buttonProps: {
                      variant: "default",
                      isLoading: isLoadingWallet,
                      disabled:
                        switchWalletToTargetChain == null || isLoadingWallet,
                      className: "ml-(0.8rem)",
                    },
                    label: `Switch to ${CHAIN_ID === 1 ? "Mainnet" : chain.name}`,
                  }
                : null,
            (() => {
              const daoSection = {
                id: "dao",
                title: "DAO",
                children: [
                  { id: "navigate-to-auction", title: "Auction" },
                  { id: "navigate-to-proposal-listing", title: "Proposals" },
                  {
                    id: "navigate-to-candidate-listing",
                    title: "Candidates",
                  },
                  {
                    id: "navigate-to-topic-listing",
                    title: "Discussion topics",
                  },
                  { id: "navigate-to-account-listing", title: "Voters" },
                  { id: "open-treasury-dialog", title: "Treasury" },
                ],
              };
              const externalSection = {
                id: "external",
                title: "External",
                children: [
                  {
                    id: "open-warpcast",
                    title: "Farcaster",
                    iconRight: <span>{"\u2197"}</span>,
                  },
                  {
                    id: "open-flows",
                    title: "Flows",
                    iconRight: <span>{"\u2197"}</span>,
                  },
                ],
              };
              const settingsSection = {
                id: "settings",
                title: "Camp",
                children: [
                  { id: "open-settings-dialog", title: "Settings" },
                  {
                    id: "open-camp-changelog",
                    title: "Changelog",
                    iconRight: <span>{"\u2197"}</span>,
                  },
                  {
                    id: "open-camp-discord",
                    title: "Discord",
                    iconRight: <span>{"\u2197"}</span>,
                  },
                  {
                    id: "open-camp-github",
                    title: "GitHub",
                    iconRight: <span>{"\u2197"}</span>,
                  },
                ],
              };

              if (connectedWalletAccountAddress == null)
                return {
                  type: "dropdown",
                  items: [
                    daoSection,
                    externalSection,
                    settingsSection,
                    loggedInAccountAddress != null && {
                      id: "disconnect",
                      children: [{ id: "sign-out", title: "Log out" }],
                    },
                  ].filter(Boolean),
                  buttonProps: {
                    className: "flex",
                    icon: <DotsIcon className="h-auto w-(1.8rem)" />,
                  },
                };

              return {
                type: "dropdown",
                items: [
                  {
                    id: "connected-account",
                    title: "You",
                    children: [
                      {
                        id: "open-account-dialog",
                        title: "Account",
                      },
                      ensName != null && {
                        id: "open-edit-profile-dialog",
                        title: "Edit profile",
                      },
                      (hasNouns || hasVotingPower) && {
                        id: "open-delegation-dialog",
                        title: "Manage delegation",
                      },
                      hasStreams && {
                        id: "open-streams-dialog",
                        title: "Streams",
                      },
                      {
                        id: "open-drafts-dialog",
                        title: "Proposal & topic drafts",
                      },
                      !hasVerifiedFarcasterAccount
                        ? null
                        : !hasFarcasterAccountKey
                          ? {
                              id: "setup-farcaster",
                              title: "Setup Farcaster",
                            }
                          : !isConnectedWalletAccountAuthenticated
                            ? {
                                id: "sign-in",
                                title: "Authenticate account",
                              }
                            : null,
                    ].filter(Boolean),
                  },
                  daoSection,
                  externalSection,
                  settingsSection,
                  {
                    id: "disconnect",
                    children: [
                      loggedInAccountAddress != null && {
                        id: "sign-out",
                        title: "Log out",
                      },
                      connectedWalletAccountAddress != null && {
                        id: "disconnect-wallet",
                        title: "Disconnect wallet",
                      },
                    ].filter(Boolean),
                  },
                ],
                buttonProps: {
                  className: "flex max-sm:ml-(0.3rem) max-sm:px-(0.4rem)",
                  iconRight: <CaretDownIcon className="h-auto w-(0.9rem)" />,
                },
                label: (
                  <div className="flex items-center gap-(0.8rem)">
                    {pathname === "/" && (
                      <div className="account-display-name hidden sm:block">
                        {userAccountDisplayName}
                      </div>
                    )}
                    <AccountAvatar address={userAccountAddress} size="2rem" />
                  </div>
                ),
              };
            })(),
          ]
            .filter(Boolean)
            .map((a, i) => {
              if (a.type === "separator")
                return (
                  <li
                    key={i}
                    role="separator"
                    aria-orientation="vertical"
                    className="mx-(0.4rem) h-(1.6rem) w-(0.1rem) list-none bg-border-light"
                  />
                );

              const ButtonComponent = a.component ?? Button;
              const baseButtonProps = {
                variant: a.buttonVariant ?? "transparent",
                size: "small",
                children: a.label,
                ...a.buttonProps,
              };
              const { className: buttonClassName, ...restButtonProps } =
                baseButtonProps;

              return (
                <li
                  key={a.key ?? i}
                  data-desktop-only={a.desktopOnly}
                  className={clsx(
                    "list-none",
                    a.desktopOnly && "max-sm:hidden",
                  )}
                >
                  {a.type === "dropdown" ? (
                    <DropdownMenu.Root placement={a.placement ?? "bottom"}>
                      <DropdownMenu.Trigger asChild>
                        <ButtonComponent
                          className={buttonClassName}
                          {...restButtonProps}
                        />
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content
                        className="w-min min-w-min max-w-[calc(100vw-2rem)]"
                        items={a.items}
                        onAction={handleDropDownAction}
                      >
                        {(item) => (
                          <DropdownMenu.Section
                            title={item.title}
                            items={item.children}
                          >
                            {(item) => <DropdownMenu.Item {...item} />}
                          </DropdownMenu.Section>
                        )}
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  ) : (
                    <ButtonComponent
                      className={buttonClassName}
                      {...restButtonProps}
                      onClick={a.onSelect}
                    />
                  )}
                </li>
              );
            })}
        </ul>
      </div>
    </nav>
  );
};

export const MainContentContainer = ({
  sidebar = null,
  narrow = false,
  containerHeight,
  sidebarWidth,
  sidebarGap,
  pad = true,
  children,
  ...props
}) => (
  <div
    className={clsx(
      "w-full",
      "sm:mx-auto sm:w-[var(--layout-width)] sm:max-w-full",
      pad ? "sm:px-(4rem) xl:px-(8rem)" : "sm:px-0 xl:px-0",
    )}
    style={{ "--layout-width": narrow ? "92rem" : "134rem" }}
    {...props}
  >
    {sidebar == null ? (
      children
    ) : (
      <div
        className="xl:grid xl:grid-cols-[minmax(0,1fr)_var(--sidebar-width,40rem)] xl:gap-[var(--sidebar-gap,10rem)]"
        style={{
          "--container-height": containerHeight,
          "--sidebar-width": sidebarWidth,
          "--sidebar-gap": sidebarGap,
        }}
      >
        <div>{children}</div>
        <div>
          <div
            data-sidebar-content
            className="xl:sticky xl:top-0 xl:max-h-[var(--container-height,calc(100vh-var(--size-navbar)))] xl:overflow-auto xl:-mx-(2rem) xl:px-(2rem)"
          >
            {sidebar}
          </div>
        </div>
      </div>
    )}
  </div>
);

const AuctionNounImage = (props) => {
  const { auction } = useAuctionData();
  const seed = useLazySeed(auction?.nounId);
  const imageDataUri = useNounImageDataUri(seed);
  if (imageDataUri == null) return <div {...props} />;
  return <img src={imageDataUri} {...props} />;
};

const NoggleImage = () => (
  <svg
    fill="none"
    width="160"
    height="60"
    shapeRendering="crispEdges"
    viewBox="0 0 160 60"
  >
    <g fill="#d53c5e">
      <path d="m90 0h-60v10h60z" />
      <path d="m160 0h-60v10h60z" />
      <path d="m40 10h-10v10h10z" />
    </g>
    <path d="m60 10h-20v10h20z" fill="#fff" />
    <path d="m80 10h-20v10h20z" fill="#000" />
    <path d="m90 10h-10v10h10z" fill="#d53c5e" />
    <path d="m110 10h-10v10h10z" fill="#d53c5e" />
    <path d="m130 10h-20v10h20z" fill="#fff" />
    <path d="m150 10h-20v10h20z" fill="#000" />
    <path d="m160 10h-10v10h10z" fill="#d53c5e" />
    <path d="m40 20h-40v10h40z" fill="#d53c5e" />
    <path d="m60 20h-20v10h20z" fill="#fff" />
    <path d="m80 20h-20v10h20z" fill="#000" />
    <path d="m110 20h-30v10h30z" fill="#d53c5e" />
    <path d="m130 20h-20v10h20z" fill="#fff" />
    <path d="m150 20h-20v10h20z" fill="#000" />
    <path d="m160 20h-10v10h10z" fill="#d53c5e" />
    <path d="m10 30h-10v10h10z" fill="#d53c5e" />
    <path d="m40 30h-10v10h10z" fill="#d53c5e" />
    <path d="m60 30h-20v10h20z" fill="#fff" />
    <path d="m80 30h-20v10h20z" fill="#000" />
    <path d="m90 30h-10v10h10z" fill="#d53c5e" />
    <path d="m110 30h-10v10h10z" fill="#d53c5e" />
    <path d="m130 30h-20v10h20z" fill="#fff" />
    <path d="m150 30h-20v10h20z" fill="#000" />
    <path d="m160 30h-10v10h10z" fill="#d53c5e" />
    <path d="m10 40h-10v10h10z" fill="#d53c5e" />
    <path d="m40 40h-10v10h10z" fill="#d53c5e" />
    <path d="m60 40h-20v10h20z" fill="#fff" />
    <path d="m80 40h-20v10h20z" fill="#000" />
    <path d="m90 40h-10v10h10z" fill="#d53c5e" />
    <path d="m110 40h-10v10h10z" fill="#d53c5e" />
    <path d="m130 40h-20v10h20z" fill="#fff" />
    <path d="m150 40h-20v10h20z" fill="#000" />
    <path d="m160 40h-10v10h10z" fill="#d53c5e" />
    <path d="m90 50h-60v10h60z" fill="#d53c5e" />
    <path d="m160 50h-60v10h60z" fill="#d53c5e" />
  </svg>
);

export default Layout;
