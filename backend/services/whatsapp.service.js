const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { 
  getGymById, 
  updateGymWhatsAppStatus 
} = require('../utils/supabase');

class WhatsAppService {
  constructor() {
    this.clients = new Map();
  }

  async initGymClient(gymId) {
    // Return existing client if available and connected
    if (this.clients.has(gymId)) {
      const existingClient = this.clients.get(gymId);
      if (existingClient.client.info) { // Check if client is properly initialized
        return existingClient;
      }
      // Clean up broken client
      await this.disconnectGymClient(gymId);
    }

    // Get gym info for phone number
    const gym = await getGymById(gymId);
    if (!gym) {
      throw new Error('Gym not found');
    }

    // Initialize WhatsApp client
    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: `gym_${gymId}`,
        dataPath: `./sessions/gym_${gymId}`
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      },
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/'
      }
    });

    // Store client instance
    const clientInfo = {
      client,
      qrCode: null,
      status: 'initializing',
      isConnected: false,
      gymId
    };
    
    this.clients.set(gymId, clientInfo);

    // Set up event listeners
    client.on('qr', async (qr) => {
      try {
        const qrCode = await qrcode.toDataURL(qr);
        const clientInfo = this.clients.get(gymId);
        if (!clientInfo) return;
        
        clientInfo.qrCode = qrCode;
        clientInfo.status = 'awaiting_scan';
        clientInfo.isConnected = false;
        
        // Update gym status in database
        await updateGymWhatsAppStatus(gymId, 'awaiting_scan', qrCode);
      } catch (error) {
        console.error('Error handling QR code:', error);
      }
    });

    client.on('ready', async () => {
      try {
        const clientInfo = this.clients.get(gymId);
        if (!clientInfo) return;
        
        clientInfo.status = 'connected';
        clientInfo.isConnected = true;
        clientInfo.qrCode = null;
        
        // Update gym status in database
        await updateGymWhatsAppStatus(gymId, 'connected');
        
        console.log(`WhatsApp client for gym ${gymId} is ready!`);
      } catch (error) {
        console.error('Error in ready event:', error);
      }
    });

    client.on('disconnected', async (reason) => {
      try {
        console.log(`WhatsApp client for gym ${gymId} disconnected:`, reason);
        await this.handleDisconnect(gymId);
      } catch (error) {
        console.error('Error in disconnected event:', error);
      }
    });

    client.on('auth_failure', async (msg) => {
      console.error(`Authentication failure for gym ${gymId}:`, msg);
      await this.handleDisconnect(gymId, 'auth_failure');
    });

    // Initialize the client
    try {
      await client.initialize();
      return this.clients.get(gymId);
    } catch (error) {
      console.error('Error initializing WhatsApp client:', error);
      await this.handleDisconnect(gymId, 'initialization_error');
      throw error;
    }
  }

  async handleDisconnect(gymId, reason = 'disconnected') {
    const clientInfo = this.clients.get(gymId);
    if (clientInfo) {
      try {
        if (clientInfo.client) {
          await clientInfo.client.destroy();
        }
      } catch (e) {
        console.error('Error destroying client:', e);
      }
      this.clients.delete(gymId);
    }
    
    // Update status in database
    await updateGymWhatsAppStatus(gymId, 'disconnected');
    console.log(`WhatsApp client for gym ${gymId} cleaned up: ${reason}`);
  }

  getGymClient(gymId) {
    return this.clients.get(gymId) || null;
  }

  async disconnectGymClient(gymId) {
    await this.handleDisconnect(gymId, 'manual_disconnect');
  }

  async sendMessage(gymId, to, message) {
    const clientInfo = this.clients.get(gymId);
    if (!clientInfo || !clientInfo.client) {
      throw new Error('WhatsApp client not initialized for this gym');
    }
    
    if (!clientInfo.isConnected) {
      throw new Error('WhatsApp client is not connected');
    }
    
    // Format the number to WhatsApp format (add @c.us if not present)
    const formattedNumber = to.endsWith('@c.us') ? to : `${to}@c.us`;
    
    // Send the message
    return await clientInfo.client.sendMessage(formattedNumber, message);
  }
}

module.exports = new WhatsAppService();
