const { createClient } = require('@supabase/supabase-js');
const { z } = require('zod');

// Create Supabase client with auto-refresh schema option
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

// Function to clear Supabase schema cache
async function clearSchemaCache() {
  try {
    await supabase.rpc('notify', { channel: 'pgrst', payload: 'reload schema' });
    console.log('Supabase schema cache cleared');
  } catch (error) {
    console.warn('Could not clear Supabase schema cache:', error.message);
  }
}

// Clear schema cache on startup
clearSchemaCache();

// Schema for gym data validation
const gymSchema = z.object({
  gym_id: z.string().uuid(),
  name: z.string(),
  phone_number: z.string().optional().nullable(),
  whatsapp_status: z.enum(['disconnected', 'connecting', 'connected', 'error']).default('disconnected'),
  whatsapp_qr_code: z.string().optional().nullable(),
  whatsapp_connected_at: z.string().datetime().optional().nullable(),
  owner_name: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  created_at: z.string().datetime()
});

// Get gym by ID
async function getGymById(gymId) {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('gym_id', gymId)
    .single();
  
  if (error) throw error;
  return gymSchema.parse(data);
}

// Get gym by owner phone
async function getGymByOwnerPhone(phone) {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('phone_number', phone)
    .single();
  
  if (error) return null;
  return gymSchema.parse(data);
}

// Update gym WhatsApp status
async function updateGymWhatsAppStatus(gymId, status, qrCode = null) {
  const updateData = { whatsapp_status: status };
  
  if (qrCode) {
    updateData.whatsapp_qr_code = qrCode;
  }
  
  if (status === 'connected') {
    updateData.whatsapp_connected_at = new Date().toISOString();
  } else if (status === 'disconnected') {
    updateData.whatsapp_qr_code = null;
    updateData.whatsapp_connected_at = null;
  }
  
  const { data, error } = await supabase
    .from('gyms')
    .update(updateData)
    .eq('gym_id', gymId)
    .select()
    .single();
    
  if (error) throw error;
  return gymSchema.parse(data);
}

// Update gym phone number
async function updateGymPhoneNumber(gymId, phoneNumber) {
  const { data, error } = await supabase
    .from('gyms')
    .update({ 
      phone_number: phoneNumber,
      whatsapp_status: 'disconnected',
      whatsapp_qr_code: null,
      whatsapp_connected_at: null
    })
    .eq('gym_id', gymId)
    .select()
    .single();
    
  if (error) throw error;
  return gymSchema.parse(data);
}

// Add a new member to a gym
async function addGymMember(gymId, memberData) {
  const { data, error } = await supabase
    .from('members')
    .insert([{ ...memberData, gym_id: gymId }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Get gym configuration
async function getGymConfig(gymId) {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('gym_id', gymId)
    .single();
    
  if (error) return null;
  return gymSchema.parse(data);
}

// Log message interaction
async function logMessage(interaction) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      ...interaction,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
    
  if (error) {
    console.error('Error logging message:', error);
  }
  return data;
};

module.exports = {
  supabase,
  gymSchema,
  getGymById,
  getGymByOwnerPhone,
  updateGymWhatsAppStatus,
  updateGymPhoneNumber,
  addGymMember,
  getGymConfig,
  logMessage
};
