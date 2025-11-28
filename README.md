# ForgeAI

Next.js 16 + Prisma app for creating AI bots, browsing public bots, and chatting with them.

https://github.com/user-attachments/assets/a99ecbe1-92a6-4c5d-8564-d543fc417402

# Update 1
Changes:
- Add chat history
- Add admin page
- Add avatar upload, with cloudflare r2
- Add ratelimit and cache in some routes with redis
- Moved localstorage messages to database

## Setup

```bash
npm install
cp .env.example .env # fill the .env
npx prisma db push
npm run dev
```
