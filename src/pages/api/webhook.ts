export const prerender = false;

const DEFAULT_WEBHOOK =
  'https://webhooks.tasklet.ai/v1/public/webhook?token=150dabd568ade5267a8d311a37e18853';

export async function POST({ request }: { request: Request }) {
  const webhookUrl = process.env.TASKLET_WEBHOOK_URL || DEFAULT_WEBHOOK;
  if (!webhookUrl) {
    return new Response(JSON.stringify({ error: 'Missing webhook URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = await request.json().catch(() => ({}));

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    return new Response(text || JSON.stringify({ ok: response.ok }), {
      status: response.ok ? 200 : response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Failed to forward submission',
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
