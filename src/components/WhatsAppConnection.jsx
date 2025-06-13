
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, QrCode } from "lucide-react";
import { websocketService } from '@/services/websocket.service';

export function WhatsAppConnection({ gymId }) {
  const [status, setStatus] = useState('loading');
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Connect to WebSocket and join gym room
    const socket = websocketService.connect();
    websocketService.joinGymRoom(gymId);

    // Listen for QR code updates
    websocketService.onQRCode((qr) => {
      setQrCode(qr);
      setStatus('awaiting_scan');
      setIsLoading(false);
    });

    // Listen for status updates
    websocketService.onStatusChange((newStatus) => {
      setStatus(newStatus);
      if (newStatus === 'connected') {
        setQrCode('');
        setIsLoading(false);
      }
    });

    // Check initial status
    checkStatus();

    return () => {
      websocketService.disconnect();
    };
  }, [gymId]);

  const checkStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/gyms/${gymId}/whatsapp/status`);
      const data = await response.json();
      setStatus(data.status || 'disconnected');
      if (data.qrCode) {
        setQrCode(data.qrCode);
      }
    } catch (err) {
      console.error('Error checking status:', err);
      setError('Failed to check WhatsApp status');
    }
  };

  const connectWhatsApp = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/gyms/${gymId}/whatsapp/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (data.qrCode) {
        setQrCode(data.qrCode);
        setStatus('awaiting_scan');
      } else if (data.status) {
        setStatus(data.status);
      }
    } catch (err) {
      console.error('Error connecting WhatsApp:', err);
      setError('Failed to connect WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/gyms/${gymId}/whatsapp/disconnect`, {
        method: 'POST',
      });
      setStatus('disconnected');
      setQrCode('');
    } catch (err) {
      console.error('Error disconnecting WhatsApp:', err);
      setError('Failed to disconnect WhatsApp');
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Connected
          </span>
        );
      case 'awaiting_scan':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <QrCode className="w-4 h-4 mr-1" /> Awaiting Scan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-4 h-4 mr-1" /> Disconnected
          </span>
        );
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>WhatsApp Connection</span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {status === 'awaiting_scan' && qrCode && (
          <div className="mb-4 flex flex-col items-center">
            <p className="text-sm text-gray-600 mb-3">
              Scan this QR code with WhatsApp to connect:
            </p>
            <img 
              src={qrCode} 
              alt="WhatsApp QR Code" 
              className="w-48 h-48 border rounded-md p-2 bg-white"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Open WhatsApp → Menu → Linked Devices → Link a Device
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          {status === 'disconnected' ? (
            <Button
              onClick={connectWhatsApp}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect WhatsApp'
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={disconnectWhatsApp}
              className="w-full"
            >
              Disconnect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
