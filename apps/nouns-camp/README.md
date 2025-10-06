# Nouners

[nouns.camp](https://nouners.com/)

## Fork Notice

Nouners is a community-maintained fork of the Nouns Camp project. This fork explores new features and experiments quickly, with gratitude to the original Nouns Camp authors and community.

## Purpose & Contributions

We focus on rapid iteration, UX refinements, and community-centric features. Contributions are welcome—please open issues or pull requests with proposals, bug fixes, or experiments.

## License

This app is part of the Nouners monorepo and is licensed under GPL-3.0. See the repository root `LICENSE` for details.

## Development

```bash
# Install dependencies
pnpm install

# Build required workspace dependencies
pnpm --filter @shades/common build
pnpm --filter @shades/ui-web build

# OR run in dev mode to watch for changes
pnpm --filter @shades/common dev
pnpm --filter @shades/ui-web dev

# Run dev server
pnpm --filter nouns-camp dev

# Run tests if you’re into that kind of thing
pnpm --filter nouns-camp test
```
