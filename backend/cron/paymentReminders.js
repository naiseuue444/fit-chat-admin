const { schedule } = require('node-cron');
const { supabase } = require('../utils/supabase');
require('dotenv').config();

// Run every day at 10 AM
const cronSchedule = '0 10 * * *';

function setupPaymentReminders(whatsappClient) {
  schedule(cronSchedule, async () => {
    try {
      // Get users whose payment is due in 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .lte('next_due', threeDaysFromNow.toISOString())
        .eq('payment_reminder_sent', false);
      
      if (error) throw error;
      
      for (const user of users) {
        const message = `🔔 Reminder: Your gym membership payment is due on ${new Date(user.next_due).toLocaleDateString()}. Please make the payment to avoid any interruption in service.`;
        
        // Send WhatsApp message
        await whatsappClient.sendMessage(`${user.phone}@c.us`, message);
        
        // Update reminder status
        await supabase
          .from('users')
          .update({ payment_reminder_sent: true })
          .eq('id', user.id);
      }
      
      console.log(`Sent payment reminders to ${users.length} users`);
    } catch (error) {
      console.error('Error in payment reminders job:', error);
    }
  });
}

module.exports = {
  setupPaymentReminders
};
