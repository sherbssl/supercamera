import type { IncomingMessage, ServerResponse } from 'http';

export interface ServerlessRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
  body?: unknown;
}

export interface ServerlessResponse extends ServerResponse {
  status?: (statusCode: number) => ServerlessResponse;
  json?: (body: unknown) => void;
  send?: (body: unknown) => void;
}

/**
 * Serverless Health Check Handler
 * Route: /api/health
 */
export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse,
) {
  // CORS Headers
  res.setHeader?.('Access-Control-Allow-Origin', '*');
  res.setHeader?.('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader?.('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      res.status(200);
    } else if (typeof res.writeHead === 'function') {
      res.writeHead(200);
    }
    res.end();
    return;
  }

  const payload = {
    status: 'ok',
    service: 'singapore-traffic-camera-serverless',
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? Math.floor(process.uptime()) : 0,
  };

  res.setHeader?.('Content-Type', 'application/json');

  if (typeof res.status === 'function') {
    res.status(200);
    if (typeof res.json === 'function') {
      res.json(payload);
      return;
    }
  } else if (typeof res.writeHead === 'function') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
  }

  res.end(JSON.stringify(payload));
}

/**
 * Web Standard Handler for Edge Runtimes
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'singapore-traffic-camera-serverless',
      timestamp: new Date().toISOString(),
      uptime: process.uptime ? Math.floor(process.uptime()) : 0,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store',
      },
    },
  );
}
