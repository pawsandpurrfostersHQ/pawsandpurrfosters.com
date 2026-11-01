# Private editor publishing service setup

This service is intentionally isolated from the public site.

## Safety model
- Supabase verifies the caller's access token with `auth.getUser()`.
- Only `pawsandpurrfosters@gmail.com` is authorized.
- GitHub credentials exist only as Supabase Edge Function secrets.
- Commits are restricted to `private-editor-foundation`, never `main`.
- Only the explicitly allowlisted data/script files can be written.
- This function does not merge, deploy, or publish to the public site.

## Deploy
From a local checkout of this repository:

```sh
supabase login
supabase link --project-ref ovnbbpcrwbvotyevghcx
supabase secrets set GITHUB_TOKEN=YOUR_FINE_GRAINED_TOKEN
supabase secrets set GITHUB_REPOSITORY=pawsandpurrfostersHQ/pawsandpurrfosters.com
supabase functions deploy publish-draft
```

Create a fine-grained GitHub token limited to this repository with Contents: Read and write. Store it only as the `GITHUB_TOKEN` Edge Function secret. Never put it in browser JavaScript or commit it to Git.

The project must also have its Edge Function environment variables `SUPABASE_URL` and `SUPABASE_ANON_KEY` available (Supabase supplies these in hosted Edge Functions).

## Endpoint
The browser calls `/functions/v1/publish-draft` with its signed-in Supabase access token and a JSON body containing a `files` object. File paths must be from the allowlist in `index.ts`.

## Important current limitation
The editor UI still needs its draft serialization and upload flow wired to this endpoint before the Publish control can be enabled. This scaffold alone is not a complete publishing workflow.
