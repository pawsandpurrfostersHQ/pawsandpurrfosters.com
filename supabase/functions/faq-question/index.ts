import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BREVO_KEY = Deno.env.get("BREVO_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const ADMIN_EMAIL = "pawsandpurrfosters@gmail.com";
const EDITOR_ADMIN_EMAIL = "michelle11holguin@gmail.com";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
});
const safe = (value: unknown, max = 500) => String(value ?? "").trim().slice(0, max);
const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c] || c));
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

async function sendEmail(to: string, subject: string, html: string) {
  if (!BREVO_KEY) throw new Error("Email service is not configured.");
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_KEY,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Paws & Purr Fosters", email: ADMIN_EMAIL },
      to: [{ email: to }],
      replyTo: { name: "Paws & Purr Fosters", email: ADMIN_EMAIL },
      subject,
      htmlContent: html,
    }),
  });
  const responseText = await response.text();
  if (!response.ok) {
    console.error("[faq-question] email provider rejected request", response.status, responseText.slice(0, 300));
    throw new Error("The message could not be delivered. Please try again later.");
  }
  return responseText;
}

 
async function adminDatabaseRequest(path: string, init: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Private question storage is not configured.");
  }
  const response = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    ...init,
    headers: {
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const responseText = await response.text();
  if (!response.ok) {
    console.error("[faq-question] database request failed", response.status, responseText.slice(0, 300));
    throw new Error("The question could not be saved to the private inbox.");
  }
  return responseText ? JSON.parse(responseText) : null;
}

async function storeQuestion(record: Record<string, unknown>) {
  await adminDatabaseRequest("faq_questions", {
    method: "POST",
    headers: { "Prefer": "return=minimal" },
    body: JSON.stringify(record),
  });
}

async function sendAdminResponse(req: Request, body: Record<string, unknown>) {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\\s+/i, "") || "";
  if (!token || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return json({ error: "Please sign in again to send a response." }, 401);
  }
  const authResponse = await fetch(SUPABASE_URL + "/auth/v1/user", {
    headers: { "apikey": SUPABASE_ANON_KEY, "Authorization": "Bearer " + token },
  });
  if (!authResponse.ok) return json({ error: "Your editor session is no longer valid. Please sign in again." }, 401);
  const user = await authResponse.json();
  if (String(user.email || "").toLowerCase() !== EDITOR_ADMIN_EMAIL) {
    return json({ error: "You are not authorized to send FAQ responses." }, 403);
  }

  const id = safe(body.id, 80);
  const intro = safe(body.intro, 2000);
  const answer = safe(body.body, 10000);
  const closing = safe(body.closing, 3000);
  if (!id || !answer) return json({ error: "A question and a personalized response are required." }, 400);

  const rows = await adminDatabaseRequest("faq_questions?id=eq." + encodeURIComponent(id) + "&select=id,email,first_name", { method: "GET" });
  const question = Array.isArray(rows) ? rows[0] : null;
  if (!question?.email || !validEmail(String(question.email))) {
    return json({ error: "The visitor's email address could not be found." }, 404);
  }

  const fullResponse = [intro, answer, closing].filter(Boolean).join("\\n\\n");
  const html = [intro, answer, closing].filter(Boolean)
    .map(part => "<p>" + escapeHtml(part).replace(/\\n/g, "<br>") + "</p>").join("");
  await sendEmail(String(question.email), "Re: Your question — Paws & Purr Fosters", html);

  const sentAt = new Date().toISOString();
  await adminDatabaseRequest("faq_questions?id=eq." + encodeURIComponent(id), {
    method: "PATCH",
    headers: { "Prefer": "return=minimal" },
    body: JSON.stringify({
      response_intro: intro,
      response_body: answer,
      response_closing: closing,
      sent_response: fullResponse,
      response_sent_at: sentAt,
      status: "response_sent",
      archived_at: null,
      updated_at: sentAt,
    }),
  });
  return json({ ok: true, message: "Your response was sent and saved." });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const body = await req.json();
    if (body?.action === "admin-send") return await sendAdminResponse(req, body);
    // Quietly accept honeypot submissions without sending email.
    if (safe(body._honey, 200)) return json({ ok: true });

    const first = safe(body.first_name, 60);
    const last = safe(body.last_name, 60);
    const email = safe(body.email, 254).toLowerCase();
    const question = safe(body.question, 5000);
    const kittens = Array.isArray(body.kittens)
      ? body.kittens.map((item: unknown) => safe(item, 80)).filter(Boolean).slice(0, 20)
      : [];

    if (!first || !last || !validEmail(email) || !question) {
      return json({ error: "Please complete your name, email address, and question." }, 400);
    }

    await storeQuestion({
      first_name: first,
      last_name: last,
      email,
      kittens,
      question,
      status: "new",
    });

    const html = [
      "<h2>New question from the Paws &amp; Purr Fosters website</h2>",
      "<p><b>Name:</b> " + escapeHtml(first + " " + last) + "</p>",
      "<p><b>Email:</b> " + escapeHtml(email) + "</p>",
      "<p><b>Kitten(s):</b> " + (kittens.length ? kittens.map(escapeHtml).join(", ") : "General question / not specified") + "</p>",
      "<p><b>Question:</b></p><p>" + escapeHtml(question).replace(/\n/g, "<br>") + "</p>",
    ].join("");

    try {
      await sendEmail(ADMIN_EMAIL, "Website question — " + first + " " + last, html);
    } catch (error) {
      // The question is safely stored in the private editor inbox even if the notification email fails.
      console.error("[faq-question] admin notification email failed; submission remains in the editor inbox", error);
    }

    // A confirmation is helpful but should not make a successfully delivered inquiry appear to fail.
    try {
      await sendEmail(email, "We received your question — Paws & Purr Fosters",
        "<p>Hi " + escapeHtml(first) + ",</p><p>Thank you for reaching out to Paws &amp; Purr Fosters. We received your message and will be in touch as soon as we can.</p><p>Paws &amp; Purr Fosters</p>");
    } catch (error) {
      console.error("[faq-question] visitor confirmation email failed", error);
    }

    return json({ ok: true, message: "Your question has been sent. Thank you for reaching out!" });
  } catch (error) {
    console.error("[faq-question] request failed", error);
    return json({ error: "Sorry, your question could not be sent right now. Please try again later or email pawsandpurrsfosters@gmail.com directly." }, 500);
  }
});