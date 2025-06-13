const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsapp.controller');
const { body } = require('express-validator');

// Middleware to validate gymId parameter
const validateGymId = (req, res, next) => {
  const { gymId } = req.params;
  if (!gymId || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(gymId)) {
    return res.status(400).json({ error: 'Invalid gym ID' });
  }
  next();
};

// Connect WhatsApp
router.post(
  '/:gymId/connect',
  validateGymId,
  [
    body('phoneNumber')
      .optional()
      .isMobilePhone('any', { strictMode: false })
      .withMessage('Invalid phone number format')
  ],
  whatsappController.connect
);

// Get WhatsApp status
router.get('/:gymId/status', validateGymId, whatsappController.getStatus);

// Disconnect WhatsApp
router.post('/:gymId/disconnect', validateGymId, whatsappController.disconnect);

// Webhook for incoming messages (to be implemented)
router.post('/webhook/:gymId', validateGymId, (req, res) => {
  // Handle incoming webhook messages
  res.status(200).json({ status: 'ok' });
});

// Send message (for testing)
router.post(
  '/:gymId/send-message',
  validateGymId,
  [
    body('to').isMobilePhone('any', { strictMode: false }),
    body('message').isString().notEmpty()
  ],
  whatsappController.sendMessage
);

module.exports = router;
