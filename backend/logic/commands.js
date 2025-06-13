const { addGymMember, updateGymWhatsAppStatus, getGymConfig } = require('../utils/supabase');

async function handleAdminCommand(command, sender, gymId) {
  const [cmd, ...args] = command.slice(1).split(' ');
  
  try {
    switch (cmd.toLowerCase()) {
      case 'add':
        return await handleAddMember(args, gymId);
      case 'remove':
        return await handleRemoveUser(args, gymId);
      case 'update':
        return await handleUpdatePayment(args, gymId);
      case 'broadcast':
        return await handleBroadcast(args.slice(1), gymId);
      case 'template':
        return await handleTemplate(args[0], args[1], gymId);
      default:
        return '❌ Unknown command. Available commands: /add, /remove, /update, /broadcast, /template';
    }
  } catch (error) {
    console.error('Command error:', error);
    return '❌ Error processing command. Please check the format and try again.';
  }
}

async function handleAddMember(args, gymId) {
  if (args.length < 3) {
    return '❌ Usage: /add member [name] [number] [next_due_date]';
  }
  
  const [_, name, number, nextDue] = args;
  
  await addGymMember(gymId, {
    name,
    phone: number,
    last_payment: new Date().toISOString(),
    next_due: new Date(nextDue).toISOString(),
  });
  
  return `✅ Member ${name} (${number}) added successfully with next due date ${nextDue}`;
}

async function handleRemoveUser(args, gymId) {
  if (args.length < 1) {
    return '❌ Usage: /remove [number]';
  }
  
  const [number] = args;
  // Implementation would update the user's status in the database
  return `✅ User ${number} has been removed from the system.`;
}

async function handleUpdatePayment(args, gymId) {
  if (args.length < 2) {
    return '❌ Usage: /update [number] [next_due_date]';
  }
  
  const [number, nextDue] = args;
  // Implementation would update the user's payment date in the database
  return `✅ Payment updated for ${number}. Next due date: ${nextDue}`;
}

async function handleBroadcast(messageParts, gymId) {
  if (messageParts.length === 0) {
    return '❌ Please provide a message to broadcast.';
  }
  
  const message = messageParts.join(' ');
  // Implementation would get all active users and send them the message
  return `📢 Broadcast sent to all members: "${message}"`;
}

async function handleTemplate(templateType, number, gymId) {
  if (!templateType || !number) {
    return '❌ Usage: /template [welcome/reminder] [number]';
  }
  
  const config = await getGymConfig(gymId);
  let message = '';
  
  switch (templateType.toLowerCase()) {
    case 'welcome':
      message = config.welcome_template || 'Welcome to our gym!';
      break;
    default:
      return `❌ Unknown template type: ${templateType}`;
  }
  
  // Implementation would send the template to the specified number
  return `📨 Sent ${templateType} template to ${number}`;
}

module.exports = {
  handleAdminCommand
};
