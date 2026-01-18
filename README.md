# AI Chat - Clean Serverless Edition 🚀

A production-ready AI personality chat application optimized for Vercel deployment.

## ✨ Features

- **Zero Local Dependencies** - Works entirely on Vercel + Neon + OpenRouter
- **Premium UI** - Beautiful glassmorphism design with smooth animations
- **6 AI Personalities** - Spider-Man, Iron Man, Captain America, Thor, Hulk, Deadpool
- **Streaming Responses** - Real-time AI responses with proper timeout handling
- **Serverless Optimized** - No blocking operations, instant cold starts

## 🚀 Quick Deploy to Vercel

1. **Clone and Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/ai-chat-clean.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL` - Your Neon PostgreSQL connection string
     - `OPENROUTER_API_KEY` - Your OpenRouter API key
     - `NODE_ENV` - Set to `production`

3. **Setup Database**
   - Create a Neon database at [neon.tech](https://neon.tech)
   - Run migrations: `npx drizzle-kit push`

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your DATABASE_URL and OPENROUTER_API_KEY

# Run dev server
npm run dev
```

## 📁 Project Structure

```
ai-chat-clean/
├── api/                  # Vercel serverless functions
│   ├── chat.ts          # Streaming chat endpoint
│   └── models.ts        # Static models list
├── src/
│   ├── components/      # React components
│   ├── db/              # Database schema & connection
│   └── main.tsx         # App entry point
└── vercel.json          # Vercel configuration
```

## 🎨 Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: Neon PostgreSQL (Serverless)
- **AI**: OpenRouter API
- **Deployment**: Vercel

## 🔒 Security

- API keys stored as environment variables
- 25-second timeout on AI requests
- Proper error handling and cleanup
- No sensitive data exposed to frontend

## 📝 License

MIT
