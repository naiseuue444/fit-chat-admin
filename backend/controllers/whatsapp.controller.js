const whatsappService = require('../services/whatsapp.service');
const { 
  getGymById, 
  updateGymWhatsAppStatus,
  updateGymPhoneNumber 
} = require('../utils/supabase');

class WhatsAppController {
  async connect(req, res) {
    try {
      const { gymId } = req.params;
      const { phoneNumber } = req.body;
      
      // Get gym info
      const gym = await getGymById(gymId);
      if (!gym) {
        return res.status(404).json({ error: 'Gym not found' });
      }

      // Update phone number if provided and different
      if (phoneNumber && phoneNumber !== gym.phone_number) {
        await updateGymPhoneNumber(gymId, phoneNumber);
      }

      // Initialize WhatsApp client
      const client = await whatsappService.initGymClient(gymId);
      
      // If QR code is already generated, return it
      if (client.qrCode) {
        await updateGymWhatsAppStatus(gymId, 'awaiting_scan', client.qrCode);
        return res.json({
          status: 'awaiting_scan',
          qrCode: client.qrCode
        });
      }

      // If already connected
      if (client.isConnected) {
        await updateGymWhatsAppStatus(gymId, 'connected');
        return res.json({ 
          status: 'connected',
          number: gym.phone_number
        });
      }

      res.json({ status: 'initializing' });
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
      await updateGymWhatsAppStatus(req.params.gymId, 'error');
      res.status(500).json({ 
        error: error.message || 'Failed to connect WhatsApp' 
      });
    }
  }

  async getStatus(req, res) {
    try {
      const { gymId } = req.params;
      
      // Get gym info
      const gym = await getGymById(gymId);
      if (!gym) {
        return res.status(404).json({ error: 'Gym not found' });
      }

      res.json({
        status: gym.whatsapp_status || 'disconnected',
        number: gym.phone_number,
        connectedAt: gym.whatsapp_connected_at,
        qrCode: gym.whatsapp_qr_code
      });
    } catch (error) {
      console.error('Error getting status:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to get status' 
      });
    }
  }

  async disconnect(req, res) {
    try {
      const { gymId } = req.params;
      
      // Disconnect the client
      await whatsappService.disconnectGymClient(gymId);
      
      // Update gym status
      await updateGymWhatsAppStatus(gymId, 'disconnected');

      res.json({ status: 'disconnected' });
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      await updateGymWhatsAppStatus(req.params.gymId, 'error');
      res.status(500).json({ 
        error: error.message || 'Failed to disconnect WhatsApp' 
      });
    }
  }

  async sendMessage(req, res) {
    try {
      const { gymId } = req.params;
      const { to, message } = req.body;
      
      // Send the message using the service
      const result = await whatsappService.sendMessage(gymId, to, message);
      
      res.json({ 
        status: 'message_sent',
        messageId: result.id.id,
        to: result.to,
        timestamp: result.timestamp,
        message
      });
    } catch (error) {
      console.error('Error sending message:', error);
      const statusCode = error.message.includes('not initialized') || error.message.includes('not connected') ? 400 : 500;
      res.status(statusCode).json({ 
        error: error.message || 'Failed to send message' 
      });
    }
  }
}

module.exports = new WhatsAppController();
