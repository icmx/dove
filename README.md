# 🕊️ dove

> [!IMPORTANT]
> Work in Progress. Most of the planned features are implemented, but some are not stable or are subject to change at any time due to ongoing development.

Experimental textboard built to be as simple as possible — but keeping some of essential features.

I'm making this entirely for fun, not for serious business production.

## Stack

  - Node.js, Fastify, TypeScript
  - LowDB (JSON file instead of a database)
  - Manual string-to-HTML UI, no any JS frameworks

There are no any shiny complex technologies here which is **by design**.

## Usage

```sh
git clone https://github.com/icmx/dove
cd dove
npm install
```

  - `npm run dev` — start a development instance
  - `npm run build` — build a production instance code
  - `npm run start` — start a production instance (requires `build` script before)
  - `npm run build-view` — utility to force build or rebuild HTML pages
