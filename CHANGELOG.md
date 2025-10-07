## [1.0.0-alpha.17] - 2025-10-07

### 📚 Documentation

- *(readme)* Add informative badges and notices
- *(readme)* Update project title for clarity
## [1.0.0-alpha.16] - 2025-10-07

### 🚜 Refactor

- *(proposals)* Change `firstImage.url` to `null`
## [1.0.0-alpha.15] - 2025-10-07

### 🚜 Refactor

- *(proposals)* Disable `getFirstImage` utility
- *(fonts)* Relocate font assets to `public` directory
- *(fonts)* Update font paths to use absolute URLs
- *(api)* Pass `request` to `getFonts` utility
## [1.0.0-alpha.14] - 2025-10-07

### 🚀 Features

- *(proposals)* Add Farcaster miniapp configuration

### 🚜 Refactor

- *(proposals)* Remove unnecessary frame config

### 🎨 Styling

- *(proposals)* Fix trailing commas in object literals
## [1.0.0-alpha.13] - 2025-10-07

### 📚 Documentation

- *(workspace)* Add AGENTS.md for workspace guidelines

### 🎨 Styling

- *(layout)* Improve code formatting for better readability

### ⚙️ Miscellaneous Tasks

- *(workflows)* Update Node.js version to 22
## [1.0.0-alpha.12] - 2025-10-07

### 🚀 Features

- *(hooks)* Signal Farcaster miniapp readiness
- *(wagmi-config)* Add Farcaster miniapp connector
- *(metadata)* Add Farcaster miniapp configuration

### ⚙️ Miscellaneous Tasks

- Update Node engine to >=22.11.0
## [1.0.0-alpha.11] - 2025-10-06

### 🐛 Bug Fixes

- *(nav)* Correct Discord URL and update repo/changelog links

### 📚 Documentation

- *(readme)* Clarify fork from Nouns Camp, invite contributions, and make licensing explicit
- *(readme)* Update repository link to nouners/nouners

### ⚙️ Miscellaneous Tasks

- *(repo)* Rename package and bump pnpm version
## [1.0.0-alpha.10] - 2025-10-06

### 🚀 Features

- Add support for rETH and stETH tokens across components and utilities
- Add support for rETH transfer action in proposal editor

### 🐛 Bug Fixes

- Lowercase contract addresses
- Solve some minor issues and update dependencies

### 🚜 Refactor

- *(nouns-camp)* Rebrand to Nouners (names and URLs)

### 📚 Documentation

- Rebrand Nouns Camp to Nouners across docs

### 🧪 Testing

- *(nouns-camp)* Update e2e title expectation to Nouners

### ⚙️ Miscellaneous Tasks

- Add git-cliff config
- Ignore ci deps commits
## [1.0.0-alpha.9] - 2025-10-05

### 🚀 Features

- Add mETH token support (#6)

### ⚙️ Miscellaneous Tasks

- *(camp)* Always mount farcaster provider
## [1.0.0-alpha.8] - 2025-10-05

### 🚀 Features

- Extend image rendering to include votes (#2)

### 🎨 Styling

- *(fonts)* Switch to oxanium typeface (#4)

### ⚙️ Miscellaneous Tasks

- Add oxanium font assets
## [1.0.0-alpha.7] - 2025-10-05

### 🚀 Features

- Refresh theme palette (#1)

### ⚙️ Miscellaneous Tasks

- *(postcss)* Add `postcss` configuration for `nouns-camp`
## [1.0.0-alpha.5] - 2025-10-05

### ⚙️ Miscellaneous Tasks

- *(env)* Update build ID variable for Workers CI
- Gate sentry behind env toggle
## [1.0.0-alpha.4] - 2025-10-05

### ⚙️ Miscellaneous Tasks

- *(nouns-camp)* Enable observability logs
- *(nouns-camp)* Update deploy script to preserve vars
## [1.0.0-alpha.3] - 2025-10-05

### ⚙️ Miscellaneous Tasks

- *(env)* Update environment variables for Cloudflare
## [1.0.0-alpha.1] - 2025-10-05

### ⚙️ Miscellaneous Tasks

- *(config)* Add `wrangler.jsonc` for worker configuration
- *(config)* Add `open-next.config.ts` for Cloudflare setup
- *(config)* Add custom deployment scripts for Cloudflare
- *(config)* Update `.gitignore` to exclude `.open-next`
- *(config)* Add caching headers for static assets
- *(api)* Comment out `runtime` definitions
- *(config)* Initialize open-next for Cloudflare dev
- *(config)* Move `wrangler.jsonc` to root folder
- *(config)* Update wrangler paths for worker setup
- *(config)* Update wrangler paths for worker setup
- *(config)* Update wrangler paths for compatibility
- *(config)* Update `.gitignore` to exclude `.wrangler`
- *(config)* Migrate `jsconfig.json` to `tsconfig.json`
- *(tsconfig)* Update TypeScript configuration
- *(config)* Update `.gitignore` for TypeScript files
- *(tsconfig)* Add `@cloudflare/workers-types` to types
- *(tsconfig)* Update `types` in TypeScript configuration
- *(scripts)* Update `cf-typegen` command parameters
- *(types)* Add Cloudflare environment type definitions
- *(config)* Add KV namespace configuration to wrangler
- *(utils)* Add Cloudflare edge config utility
- *(tsconfig)* Update paths for `@vercel/edge-config`
- *(prettierignore)* Update ignore list for new files
- *(style)* Fix indentation in `open-next.config.ts`
- *(utils)* Refactor Cloudflare edge config utility
- *(utils)* Update default binding name in edge config
## [1.0.0-alpha.0] - 2025-09-23

### 🚀 Features

- *(camp)* Farcaster likes with stateless session auth
- *(camp)* Preload auth dialogs for likes
- *(camp)* Be slightly more eager when fetching likes
- *(camp)* Fulfill like action after successful auth
- *(camp)* Be less stricky about environment variables in dev
- *(camp)* Hide candidate page sponsorStatusCallout if candidate has been promoted
- *(ui-web)* Make qrcode more readable (hopefully)
- *(camp)* Add the tx hash to propdates to make them likeable
- *(camp)* Hide like action on bare votes and signals
- *(camp)* Enable turbopack in dev
- *(camp)* Juggle connected and logged in accounts better
- *(camp)* Add stream management dialog
- *(camp)* Add wallet connection to farcaster setup flow
- *(camp)* Add shared cache directives where appropriate
- *(camp)* Add stETH transfer support
- *(camp)* Make time range select filters clearer
- *(camp)* Use @vercel/og to create static fc:frames for props without images
- *(common)* Don’t interpret end block single item lists as list
- *(camp)* Add auction event support to activity feeds
- *(camp)* Inline full author thread in cast items
- *(camp)* Enable auction and noun representation events in the main feed
- *(camp)* :nail_care:
- *(camp)* Improve account and noun preview popovers
- *(camp)* Remove like action from some feed items
- *(camp)* Use tenderly to simulate contract writes during impersonation mode
- *(camp)* Improve noun transfer parsing
- *(camp)* Add limited support for accounts to search
- *(camp)* Default to bypass next router on search param navigations
- *(camp)* Bypass app router in update banner to prevent delay
- *(camp)* Add share icon to prop/candie navbar using the native sharing UI
- *(camp)* Decrease multicall delay to 50 ms
- *(camp)* Improve main feed filter menu
- *(camp)* Add prop navigation to the navbar using <select>
- *(camp)* Allow impersonation using ens instead of wallet addr
- *(camp)* Hide like action for "proposal queued" feed items
- *(camp)* Auction v1
- *(camp)* Remove default focus ring on auction trigger
- *(camp/ui-web)* Snap trays everywhere
- *(camp)* Improve min bid formatting and suggest bid amount
- *(camp)* Add /candidates/:number route + add number to candie listings
- *(camp)* Always truncate large feed item bodies
- *(camp)* Make reposts and replies expandable
- *(camp)* Link to flows.wtf
- *(camp)* Add yet-to-vote column in vote overview
- *(camp)* Always sort absent column by attendance
- *(camp)* Add context menus to feed items
- *(camp)* Display the year on relevant dates
- *(camp)* Extract separate hook for scroll-to-element functionality
- *(camp)* Add flows.wtf activity (#95)
- *(camp)* Use same roundness on callouts as other UI elements
- *(camp)* Add underline support using <ins> (#99)
- *(common)* Make cache store synchronous
- *(camp)* Add cache support for votes (#98)
- *(camp)* Add api and utils for Farcaster replies
- *(camp)* Add cache namespace for NOM
- *(camp)* Cache current block number on the edge
- *(camp)* Add tiny swr
- *(camp)* Topics v1
- *(camp)* Remove support for signal selection for now
- *(camp)* Optimistically populate cast replies on submit
- *(camp)* Add support for inline cast reply likes
- *(camp)* Use large action form variant for topics
- *(common)* Make cached state hook clean up automatically
- *(camp)* Add nested replies to normalized state
- *(camp)* Incorporate cast replies into displayed comment and participant counts
- *(camp)* Show voting bar on active proposals in digest
- *(camp)* Add support for proposal/candidate forking
- *(camp)* Display submitting client where appropriate
- *(camp)* Digest truncation and threshold tweaks
- *(camp)* Add local cache support for ongoing prop and candie edits
- *(camp)* Try content-visibility api
- *(camp)* Update client info for Nouns 95
- *(camp)* Add development instructions
- *(camp)* Add mobile DevTools for development and preview
- *(camp)* Always show reply input in boxed activity feed
- *(camp)* Implement topics tab in voter profile UI
- *(camp)* Add UI and E2E testing infrastructure
- *(camp)* Add subgraph query tool
- *(camp)* Remove Mogu and NounsKarma (RIP 🪦) (#104)
- *(camp)* Enable pull to refresh on mobile
- *(camp)* Allow text selection on topic replies
- *(camp)* Allow clicking on logo to refresh home to default state (#107)
- *(camp)* Add client activity report generation tool for kicks
- *(camp)* Add usdc transfer from treasury support
- Add camp discord server link
- *(camp)* Update apple-icon
- Ens text record bio
- Rounder camp
- Add simplistic video rendering support
- Add support for callouts with <aside> elements
- Add command palette
- Add topics filter to landing page feed
- Add passed proposals sorting strategy to /voters
- Add basic video support to rich text editor
- Add version history fields to proposal candidate GraphQL query
- Saner formatting for simple replies
- Implement pagination for proposal votes with full vote history

### 🐛 Bug Fixes

- Link with null href
- *(camp)* Correctly link candidate repost and reply targets
- *(camp)* Remove create cost for updates
- *(camp)* Handle undefined prop status
- *(camp)* Handle unknown token contracts (sepolia)
- *(camp)* Dont swallow error
- *(camp)* Add missing string labels
- *(camp)* Fix broken "Drafts" link in navbar
- *(camp)* Use sort order from chain data rather than subgraph
- *(camp)* Add workaround to make proposal updates work on sepolia
- *(deps)* Revert unintended dependency bumps
- *(camp)* Lil ui improvements on streams dialog
- *(ci)* Add Sentry auth token to turbo env
- *(camp)* Update descriptor contract
- *(camp)* Contract address should be lower case
- *(camp)* Remove unnecessary signature normalization
- *(camp)* Correct Descriptor description (#92)
- *(camp)* Update noun-transfer hook to decode correct transfer event
- *(camp)* Update useTransferMeta to use avg sale price for sweep txns
- *(camp)* Add missing noun id argument
- *(camp)* Fix "marks" rendering to not create faulty markdown
- *(camp)* Fix transfer items showing incorrect noun data
- *(camp)* Add default value for ininitialized cache delay
- *(camp)* Fix error screen layout on small devices
- *(camp)* Fetch nonce eagerly so the signature request can be instant
- *(camp)* Prevent nonce renewal when auth is in progress
- *(camp)* Ignore update candies when matching proposal <> candidate
- *(camp)* Conditionally show execution ETA if available
- *(camp)* Correctly match all possible line terminators
- *(camp)* Fix like action not visible on signatures with comment
- *(camp)* Always allow custom abi input
- *(camp)* Always allow custom abi input
- *(camp)* Don’t complain about address length when that’s not the issue
- *(camp)* Use same size as other inputs
- *(camp)* Don’t overwrite main candidate with update candidates
- *(camp)* Correctly apply and remove markdown blockquotes
- *(camp)* IMPORTANT
- *(camp)* Parse feedback reposts correctly in vote overview
- *(camp)* Don’t assume noun is present in cache
- *(camp)* Fetch all held nouns
- *(camp)* Link author to warpcast profile page on farcaster comments
- *(camp)* Only render account list item if id is an address
- *(camp)* Fetch proposer on prop screen to avoid not having it later
- *(camp)* Prevent android from font boosting truncated content
- *(camp)* Don’t show explorer links on events without a tx hash
- *(camp)* Leftover c 🤷
- *(camp)* Type should be feedback-post to enable copying links to clipboard
- *(camp)* Disable frames for votes
- *(camp)* Increase font size and padding for vote og:image
- *(camp)* Upgrade nouns assets package
- *(camp)* Disable top up value txs temporarily
- *(camp)* Keep filters visible even if no feed items
- *(camp)* Upgrade nouns-assets to include new gnars accessory
- *(camp)* Prevent flows graph issues from breaking the feed
- *(common)* Correctly pass previous state
- *(ui-web)* Prevent close getting called multiple times on swipe down
- *(common)* Make cache store serialize and parse values by default
- *(camp)* Fix event decoding on prop and candie creation (#100)
- *(camp)* Move block-number api to edge
- *(camp)* Opt out of Vercel’s data cache
- *(camp)* GcTime -> staleTime
- *(camp)* Ops margin
- *(camp)* Make whole draft api synchronous
- *(camp)* Match topics against a dummy action pattern
- *(camp)* Switch from vercel edge runtime to work around plan limits
- *(camp)* Don’t show signaling on topic comments
- *(camp)* Clear inline reply form after successful submit
- *(camp)* Pick matching farcaster account delegate with most voting power
- *(camp)* Correctly pick avatar to display for cast items
- *(camp)* This can be null
- *(camp)* Correctly direct to topic path from feed
- *(camp)* Add missing `getServerSnapshot`
- *(camp)* "0" is the correct default value for `value`
- *(camp)* Make cached posts clear correctly
- *(camp)* Fix action serialization issues
- *(camp)* Correctly show reply actions for casts in the main feed
- *(camp)* Fix broken reply/repost href creation
- *(nom-web)* Pick target message correctly for non-thread replies
- *(camp)* Just fix, there is no understand
- *(camp)* Don’t show candidate score for topics
- *(camp)* Fix topic browse screen not showing any data
- *(camp)* Only show the most recent update per proposal to sponsors
- *(camp)* Position voting bar correctly for wider items
- *(camp)* No truncation for ongoing props
- *(camp)* Add NounSwap to clients
- *(nom-web)* FORGOT THIS ONE
- *(camps)* Use @nomonouns/assets instead of @nouns/assets
- *(camp)* Don’t include empty replies in submitted reason
- *(camp)* Exclude empty replies when formatting replies in topic screen
- *(camp)* Add eslint-plugin-jsx-a11y dependency
- *(camp)* Add temporary farcaster reply workaround
- *(camp)* Handle multi-level URL encoding in candidate IDs
- *(camp)* Improve reply parsing with better quote handling
- *(camp)* Upgrade neynar calls using v1 endpoints to using v2
- *(camp)* Fallback when simulation calldata decoding fails with OutOfBounds error
- *(camp)* Pass simulation to enhanced parsed txs
- *(camp)* Allow inline images (#103)
- *(camp)* Improve markdown parsing and image display
- *(camp)* Add missing @noble/ed25519
- *(camp)* Activate debounces by adding wait time (#108)
- *(camp)* Fix issues around imperonation simulation
- *(camp)* Re-enable transaction length validation check
- *(camp)* Escape candidate ids
- *(camp)* Include topics in search sources
- *(camp)* Fix null update mmessages
- *(camp)* Don’t render reply input on updates
- *(camp)* Bundle simulation was running on every editor change 🙈
- *(camp)* Add mandatory query param reaction_type to neynar /reactions request
- *(camp)* Reaction_type no longer mandatory again
- Don’t list favicon in manifest
- =.=
- Improve video matching heuristics
- Improve vertical alignment
- Properly open command palette
- Bust feed filter cache to show topics to everyone
- Updaet claude link
- Display stream cancellation information (#116)
- Handle UnknownSignatureError and add null checks for input types
- Update proposal candidate GraphQL query fields
- Cirrectly check empty code blocks
- Handle malformed signatures in proposal simulation and decoding

### 💼 Other

- Adjust to changes not triggered by change events
- Delegate -> wallet
- //media.tenor.com/e1NhKU9MMkwAAAAi/ez.gif
- //media1.tenor.com/m/LaS8ciJZFDAAAAAC/baby-cry.gif
- ? for the rescue
- Render status for pending or updatable props
- *(fix)* Allow non-text children
- Put candidates above topics for now

### 🚜 Refactor

- *(camp)* Remove unused `txHash`
- *(camp)* Cleanup top layout "actions" mechanism
- *(camp)* Simplify voter screen by removing pagination logic
- *(camp)* Clean up voter screen by removing unused external links and constants
- *(camp)* Rename React component files from .js to .jsx
- Use etherscan v2 api endpoints

### 📚 Documentation

- *(camp)* Add CLAUDE.md with development commands and code style guidelines
- Add root-level CLAUDE.md with workspace commands
- Add git workflow guidelines to root CLAUDE.md
- Update CLAUDE.md files with improved formatting and pnpm commands
- Rename CLAUDE.md to AI-CONTEXT.md for AI assistants

### ⚡ Performance

- Filter votes query to only include non-zero votes or with reasons
- Temporarily disable flows subgraph calls
- Disable flow votes at the subgraph level

### 🎨 Styling

- Improve error condition readability with multi-line formatting

### 🧪 Testing

- *(camp)* Add test for votes and feedbacks utils

### ⚙️ Miscellaneous Tasks

- *(camp)* Remove feature flag for likes
- *(camp)* Don’t check APP_HOST when linting
- Add workflow env to turbo config
- Update pnpm
- Bump slate dep
- Update .gitignore
- Update pnpm from 9.15.3 to 10.5.2
- Add Node.js version requirement to package.json
- *(camp)* Lint
- Update gitignore and add LLM guidelines to README
- *(camp)* Lint
- Fork Farcord
- *(camp)* Update @farcaster/core dep to support snapchain
- Remove non-camp code
- Ignore .claude
- Update Discord community link
- Add claude action
- Update to next 15
- Enhance Claude action with Node.js and pnpm setup

### ◀️ Revert

- *(camp)* Revert proposer id changes
## [0.0.0] - 2022-01-19
