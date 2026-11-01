// Supabase Edge Function: publish-draft
// Deploy with: supabase functions deploy publish-draft
// Required function secrets: GITHUB_TOKEN, GITHUB_REPOSITORY=pawsandpurrfostersHQ/pawsandpurrfosters.com
// The function commits only to the private development branch. It never writes to main.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const ADMIN_EMAIL = "pawsandpurrfosters@gmail.com";
const TARGET_BRANCH = "private-editor-foundation";
const ALLOWED_FILES = new Set([
  "kitten-data.js",
  "event-data.js",
  "alumni-data.js",
  "script.js",
]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return json({ error: "Sign-in required." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return json({ error: "You are not authorized to publish." }, 403);
  }

  const githubToken = Deno.env.get("GITHUB_TOKEN");
  const repository = Deno.env.get("GITHUB_REPOSITORY") || "pawsandpurrfostersHQ/pawsandpurrfosters.com";
  if (!githubToken) return json({ error: "Publishing service is not configured yet." }, 503);

  let payload: { files?: Record<string, string>; uploads?: Array<{ path: string; contentBase64: string; contentType: string }>; message?: string };
  try { payload = await req.json(); } catch { return json({ error: "Invalid JSON." }, 400); }
  const files = payload.files;
  if (!files || typeof files !== "object" || Array.isArray(files)) return json({ error: "No draft files supplied." }, 400);
  const entries = Object.entries(files);
  const uploads = Array.isArray(payload.uploads) ? payload.uploads : [];
  if ((!entries.length && !uploads.length) || entries.length > 4 || uploads.length > 12) return json({ error: "Supply up to four data files and twelve photos." }, 400);
  for (const [path, content] of entries) {
    if (!ALLOWED_FILES.has(path) || typeof content !== "string" || content.length > 500_000) {
      return json({ error: `File is not allowed or is too large: ${path}` }, 400);
    }
  }

  for (const upload of uploads) {
    if (!upload || typeof upload.path !== "string" || !/^assets\/kittens\/[a-z0-9-]+\.(jpg|png|webp|gif)$/.test(upload.path) ||
        typeof upload.contentBase64 !== "string" || typeof upload.contentType !== "string" || !IMAGE_TYPES.has(upload.contentType)) {
      return json({ error: "A photo upload has an invalid path or image type." }, 400);
    }
    const estimatedBytes = Math.floor(upload.contentBase64.length * 3 / 4);
    if (!upload.contentBase64 || estimatedBytes > MAX_IMAGE_BYTES || !/^[A-Za-z0-9+/]+={0,2}$/.test(upload.contentBase64)) {
      return json({ error: "Each photo must be a valid image no larger than 5 MB." }, 400);
    }
  }

  const headers = {
    Authorization: `Bearer ${githubToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
  const api = `https://api.github.com/repos/${repository}/contents`;
  const results = [];
  for (const [path, content] of entries) {
    const current = await fetch(`${api}/${path}?ref=${TARGET_BRANCH}`, { headers });
    let sha: string | undefined;
    if (current.ok) sha = (await current.json()).sha;
    else if (current.status !== 404) return json({ error: "Could not read the current draft branch file." }, 502);

    const response = await fetch(`${api}/${path}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: payload.message?.slice(0, 120) || "Update foster website draft from private editor",
        content: btoa(unescape(encodeURIComponent(content))),
        branch: TARGET_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("GitHub commit failed", response.status, detail);
      return json({ error: "GitHub could not save the draft. No live-site changes were made." }, 502);
    }
    const result = await response.json();
    results.push({ path, commit: result.commit?.sha });
  }
  for (const upload of uploads) {
    const current = await fetch(`${api}/${upload.path}?ref=${TARGET_BRANCH}`, { headers });
    let sha: string | undefined;
    if (current.ok) sha = (await current.json()).sha;
    else if (current.status !== 404) return json({ error: "Could not check whether a photo already exists." }, 502);

    const response = await fetch(`${api}/${upload.path}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: payload.message?.slice(0, 120) || "Add foster kitten photo from private editor",
        content: upload.contentBase64,
        branch: TARGET_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("GitHub photo upload failed", response.status, detail);
      return json({ error: "GitHub could not save a photo. The public website has not changed." }, 502);
    }
    const result = await response.json();
    results.push({ path: upload.path, commit: result.commit?.sha });
  }

  return json({ ok: true, branch: TARGET_BRANCH, files: results });
});
