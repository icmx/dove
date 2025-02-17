# 🕊️ dove

> [!WARNING]
> Work in Progress. Not all features are implemented for now; they will be available later.

Experimental textboard built to be as simple as it possible.

I'm making this entirely for fun, not for serious business production.

## Stack

  - Node.js, Fastify, TypeScript
  - LowDB (JSON file insteaad of a database)
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
