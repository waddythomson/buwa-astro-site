import type { APIRoute } from 'astro';

const GOOGLE_SCRIPT_FALLBACK =
  'https://script.google.com/macros/s/AKfycbzhi6c5-mctCXsQalCn0MdeaY-AA1v5i8AS0YIVhgmkqctHwfZchqXOy7_F2bE5GWU/exec';

const getWebhookUrl = () =>
  import.meta.env.BUWA_DIGITAL_WEBHOOK_URL || process.env.BUWA_DIGITAL_WEBHOOK_URL;

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
    if (webhookUrl) {
      const payload = {
        source: 'buwa-digital',
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
    }

    if (contentType.includes('application/json')) {
      const fallbackForm = new FormData();
      Object.entries(fields).forEach(([key, value]) => fallbackForm.append(key, value));
      await fetch(GOOGLE_SCRIPT_FALLBACK, { method: 'POST', body: fallbackForm });
    } else {
      const formData = await request.formData();
      await fetch(GOOGLE_SCRIPT_FALLBACK, { method: 'POST', body: formData });
    }

    return new Response(JSON.stringify({ ok: true, fallback: true }), {
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
