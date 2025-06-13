import { createApiHandler } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default createApiHandler({
  async handler(req, res) {
    const { gymId, path } = req.query;
    const pathSegments = Array.isArray(path) ? path.join('/') : '';
    const url = new URL(
      `/api/gyms/${gymId}/whatsapp/${pathSegments}`,
      API_BASE_URL
    );

    try {
      const response = await fetch(url.toString(), {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && { Authorization: req.headers.authorization }),
        },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
});
