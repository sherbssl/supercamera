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

const DATA_GOV_SG_ENDPOINT = 'https://api.data.gov.sg/v1/transport/traffic-images';

/**
 * Extracts query string parameters from incoming request
 */
function getQueryString(req: ServerlessRequest): string {
  if (!req.url) return '';
  const queryIndex = req.url.indexOf('?');
  if (queryIndex === -1) return '';
  return req.url.substring(queryIndex);
}

/**
 * Serverless Handler for Singapore LTA Traffic Images
 * Route: /api/trafficimages
 * Source: https://api.data.gov.sg/v1/transport/traffic-images (v1host only, bare replies)
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

  try {
    // Preserve query parameters (e.g., date_time=YYYY-MM-DD[T]HH:mm:ss)
    const queryString = getQueryString(req);
    const targetUrl = `${DATA_GOV_SG_ENDPOINT}${queryString}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SingaporeTrafficCameraApp/1.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const status = response.status || 502;

      res.setHeader?.('Content-Type', 'application/json');
      if (typeof res.status === 'function') {
        res.status(status);
        if (typeof res.json === 'function') {
          res.json({
            error: 'Upstream API error from data.gov.sg',
            status,
            details: errorText,
          });
          return;
        }
      } else if (typeof res.writeHead === 'function') {
        res.writeHead(status, { 'Content-Type': 'application/json' });
      }

      res.end(
        JSON.stringify({
          error: 'Upstream API error from data.gov.sg',
          status,
          details: errorText,
        }),
      );
      return;
    }

    // Bare reply from data.gov.sg
    const data = await response.json();

    res.setHeader?.('Content-Type', 'application/json');
    res.setHeader?.('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    if (typeof res.status === 'function') {
      res.status(200);
      if (typeof res.json === 'function') {
        res.json(data);
        return;
      }
    } else if (typeof res.writeHead === 'function') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
    }

    res.end(JSON.stringify(data));
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    res.setHeader?.('Content-Type', 'application/json');

    if (typeof res.status === 'function') {
      res.status(500);
      if (typeof res.json === 'function') {
        res.json({
          error: 'Failed to fetch traffic images from data.gov.sg',
          message: errMessage,
        });
        return;
      }
    } else if (typeof res.writeHead === 'function') {
      res.writeHead(500, { 'Content-Type': 'application/json' });
    }

    res.end(
      JSON.stringify({
        error: 'Failed to fetch traffic images from data.gov.sg',
        message: errMessage,
      }),
    );
  }
}

/**
 * Web Standard Handler for Edge Runtimes
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.search;
    const targetUrl = `${DATA_GOV_SG_ENDPOINT}${searchParams}`;

    const upstreamResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SingaporeTrafficCameraApp/1.0',
      },
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return new Response(
        JSON.stringify({
          error: 'Upstream API error from data.gov.sg',
          status: upstreamResponse.status,
          details: errorText,
        }),
        {
          status: upstreamResponse.status || 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }

    const data = await upstreamResponse.text();
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch traffic images from data.gov.sg',
        message: errMessage,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
}
