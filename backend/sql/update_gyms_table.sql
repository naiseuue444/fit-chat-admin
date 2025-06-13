-- Add WhatsApp related columns to gyms table
ALTER TABLE gyms
ADD COLUMN whatsapp_number VARCHAR(20),
ADD COLUMN whatsapp_status VARCHAR(20) DEFAULT 'disconnected',
ADD COLUMN whatsapp_session_id VARCHAR(100),
ADD COLUMN whatsapp_qr_code TEXT,
ADD COLUMN whatsapp_connected_at TIMESTAMP WITH TIME ZONE;
