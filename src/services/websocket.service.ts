
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });
    }

    return this.socket;
  }

  joinGymRoom(gymId: string) {
    if (this.socket) {
      this.socket.emit('join_gym', gymId);
      console.log(`Joined gym room: ${gymId}`);
    }
  }

  onQRCode(callback: (qr: string) => void) {
    if (this.socket) {
      this.socket.on('qr', callback);
      this.socket.on('whatsapp_qr', (data: { qr: string }) => {
        callback(data.qr);
      });
    }
  }

  onStatusChange(callback: (status: string) => void) {
    if (this.socket) {
      this.socket.on('ready', () => callback('connected'));
      this.socket.on('whatsapp_status', (data: { status: string }) => {
        callback(data.status);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const websocketService = new WebSocketService();
