import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const NOTIFY_EMAIL   = Deno.env.get("NOTIFY_EMAIL") ?? "toni.grunwald@gmail.com";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: cors });
  }

  let name = "", email = "";
  try {
    const body = await req.json();
    name  = String(body.name  ?? "").trim();
    email = String(body.email ?? "").trim();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (!name || !email) {
    return new Response(JSON.stringify({ error: "name and email required" }), {
      status: 422, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const payload = {
    // Use your verified Resend domain; falls back to resend test sender
    from: "Logbird <onboarding@resend.dev>",
    to: [NOTIFY_EMAIL],
    reply_to: email,
    subject: `Waitlist signup: ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;">New Waitlist Signup 🎉</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#666;font-size:13px;width:80px;">Name</td>
            <td style="padding:8px 0;font-size:14px;font-weight:600;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#666;font-size:13px;">Email</td>
            <td style="padding:8px 0;font-size:14px;">
              <a href="mailto:${email}" style="color:#4f46e5;">${email}</a>
            </td>
          </tr>
        </table>
      </div>
    `,
  };

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const resendBody = await resendRes.text();

  if (!resendRes.ok) {
    console.error("Resend error", resendRes.status, resendBody);
    return new Response(JSON.stringify({ error: "Email delivery failed", detail: resendBody }), {
      status: 502, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { ...cors, "Content-Type": "application/json" },
  });
});
