const { schedule } = require('node-cron');
const { supabase } = require('../utils/supabase');
require('dotenv').config();

// Run on the 1st of every month at 9 AM
const cronSchedule = '0 9 1 * *';

function setupProgressCards(whatsappClient) {
  schedule(cronSchedule, async () => {
    try {
      // Get all active users
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      
      for (const user of users) {
        // Get user's progress data (this is a simplified example)
        const message = `📊 Your Monthly Progress Update\n\n` +
          `👋 Hello ${user.name}!\n\n` +
          `Here's your monthly progress summary:\n\n` +
          `🏋️ Workouts completed: 12\n` +
          `🎯 Goals achieved: 3/5\n` +
          `💪 Current streak: 8 days\n\n` +
          `Keep up the great work!`;
        
        // Send WhatsApp message
        await whatsappClient.sendMessage(`${user.phone}@c.us`, message);
      }
      
      console.log(`Sent progress cards to ${users.length} users`);
    } catch (error) {
      console.error('Error in progress cards job:', error);
    }
  });
}

module.exports = {
  setupProgressCards
};
