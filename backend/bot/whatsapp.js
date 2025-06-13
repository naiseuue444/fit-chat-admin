const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { getGymByOwnerPhone, logMessage } = require('../utils/supabase');
const { handleAdminCommand } = require('../logic/commands');
const { generateAIResponse } = require('../utils/openai');

class WhatsAppBot {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: process.env.WHATSAPP_SESSION_PATH || './whatsapp-session',
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.on('qr', (qr) => {
      console.log('QR RECEIVED');
      qrcode.generate(qr, { small: true });
      // The QR code will be sent to the client via WebSocket in server.js
    });

    this.client.on('authenticated', () => {
      console.log('Client authenticated!');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('Authentication failure:', msg);
    });

    this.client.on('ready', () => {
      console.log('Client is ready!');
    });

    this.client.on('disconnected', (reason) => {
      console.log('Client was logged out:', reason);
    });

    this.client.on('message', async (msg) => {
      try {
        await this.handleIncomingMessage(msg);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });
  }

  async handleIncomingMessage(msg) {
    // Log the message
    await logMessage({
      from: msg.from,
      to: msg.to,
      body: msg.body,
      timestamp: new Date().toISOString(),
      direction: 'inbound'
    });

    // Check if message is from an admin (gym owner)
    const gym = await this.getGymByMessage(msg);
    if (!gym) {
      await msg.reply('Sorry, your gym is not registered. Please contact support.');
      return;
    }

    // Handle admin commands
    if (msg.body.startsWith('/') && this.isAdmin(msg.from, gym)) {
      const response = await handleAdminCommand(msg.body, msg.from, gym.id);
      await msg.reply(response);
      return;
    }

    // Handle regular user messages with AI
    const aiResponse = await generateAIResponse(msg.body, gym.id);
    await msg.reply(aiResponse);
    
    // Log the response
    await logMessage({
      from: msg.to,
      to: msg.from,
      body: aiResponse,
      timestamp: new Date().toISOString(),
      direction: 'outbound',
      is_ai: true
    });
  }

  async isAdmin(phone, gym) {
    return phone.endsWith(gym.owner_phone);
  }

  async getGymByMessage(msg) {
    // Extract phone number from message (removing @c.us suffix)
    const phone = msg.from.split('@')[0];
    try {
      return await getGymByOwnerPhone(phone);
    } catch (error) {
      console.error('Error getting gym:', error);
      return null;
    }
  }

  async start() {
    await this.client.initialize();
  }
}

// Start the bot if this file is run directly
if (require.main === module) {
  const bot = new WhatsAppBot();
  bot.start().catch(console.error);
}

module.exports = WhatsAppBot;
