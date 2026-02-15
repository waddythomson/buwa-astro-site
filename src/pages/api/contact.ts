export const prerender = false;

import type { APIRoute } from 'astro';

const getWebhookUrl = () =>
  import.meta.env.PUBLIC_TASKLET_WEBHOOK_URL ||
  import.meta.env.BUWA_DIGITAL_WEBHOOK_URL;

const buildFields = (formData: FormData) => {
  const fields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') {
      fields[key] = value;
    } else {
      fields[key] = value.name;
    }
  }
  return fields;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    let fields: Record<string, string> = {};

    if (contentType.includes('application/json')) {
      const json = (await request.json()) as Record<string, string>;
      fields = json || {};
    } else {
      const formData = await request.formData();
      fields = buildFields(formData);
    }

    if (fields._honeypot) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const webhookUrl = getWebhookUrl();
    if (!webhookUrl) {
      return new Response(JSON.stringify({ ok: false, error: 'missing_webhook' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = {
      source: 'BuWa Digital',
      site: 'buwadigital.com',
      formType: fields.form_type || 'contact',
      submittedAt: new Date().toISOString(),
      page: request.headers.get('referer') || '',
      fields,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ ok: false }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
