import { NextRequest } from 'next/server';
import { Client } from 'pg';
export const runtime = 'nodejs'; // 👈 force Node.js environment
export const maxDuration = 300; 
export const dynamic = 'force-dynamic';
process.env.PG_NATIVE = 'false'; // Disable pg-native
export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    async start(controller) {
      const client = new Client({
        connectionString: process.env.DATABASE_URL.replace('-pooler', '')
      });
      await client.connect();
      await client.query('LISTEN notifications');

      let closed = false;

const handler = (msg) => {
  if (closed) return;

  try {
    controller.enqueue(`event: update\ndata: ${msg.payload}\n\n`);
  } catch (err) {
    closed = true;
    cleanup(); // Ensure immediate cleanup on overflow

    // ✅ Properly handle/log the error
    console.error('Failed to enqueue SSE message:', err);

    // Optional: rethrow if upstream should know
    // throw err;
  }
};


      client.on('notification', handler);

      async function cleanup() {
        closed = true;
        client.off('notification', handler);
        try { await client.query('UNLISTEN notifications'); } catch {}
        try { await client.end(); } catch {}
        try { controller.close(); } catch {}
      }

      request.signal.addEventListener('abort', cleanup);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  });
}
