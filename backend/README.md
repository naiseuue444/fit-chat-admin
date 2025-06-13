# Fit-Chat Backend

This is the backend service for the Fit-Chat multi-gym WhatsApp bot platform.

## Features

- WhatsApp bot integration using whatsapp-web.js
- Multi-tenant architecture
- Admin commands for gym management
- AI-powered responses using OpenAI GPT-4
- Scheduled jobs for payment reminders and progress updates
- Real-time updates via WebSocket

## Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account
- OpenAI API key
- WhatsApp Web access on a mobile device

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your credentials:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase anon/public key
   - `OPENAI_API_KEY`: Your OpenAI API key

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. For production:
   ```bash
   npm start
   ```

## Project Structure

- `/bot`: WhatsApp bot implementation
- `/cron`: Scheduled jobs (payment reminders, progress cards)
- `/logic`: Business logic for commands and AI
- `/utils`: Utility functions and services

## API Endpoints

- `GET /api/status`: Check server and bot status
- WebSocket: Real-time updates for QR codes and bot status

## Environment Variables

See `.env.example` for all available environment variables.

## Deployment

1. Build the application:
   ```bash
   npm install --production
   ```

2. Set environment variables in your production environment.

3. Use a process manager like PM2 to keep the application running:
   ```bash
   pm2 start server.js --name "fit-chat-bot"
   ```

## License

MIT
