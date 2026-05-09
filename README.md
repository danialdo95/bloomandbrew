# Bloom and Brew

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Deploy on Leapcell

This repository includes `leapcell.yaml` with the deployment settings Leapcell needs:

```yaml
runtime: javascript
buildCommand: npm install && npm run build
startCommand: npm start
port: 3000
memory: 1024mb
```

If you configure the service manually in the Leapcell dashboard, use:

- Runtime: Node.js
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Port: `3000`

Leapcell's default port is `8080`, but Next.js starts on `3000` by default, so keep the service port set to `3000`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
