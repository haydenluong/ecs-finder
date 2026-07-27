- English translation
- Search/indexing 
- Automated pipeline 

Before Phase 1 (read path) — highest priority
"JavaScript fetch API and async await" — the single most important gap to fill. Everything in this migration is "ask a server for data and wait." You want to be comfortable with: a Promise is a "result that isn't here yet," await pauses until it arrives, and try/catch handles it failing. ~20 min topic.
"React fetch data useEffect loading error state" — the standard pattern you'll write in ActivityCards: three states (loading, error, data), fetch inside useEffect, render differently for each. This is the pattern of Phase 1; watch a video where someone builds it live.
"Supabase React crash course" — any 1–2 hour one from the last couple of years. You want to see: creating a project, making a table in the dashboard, and supabase.from('activities').select() in React. Don't worry about auth sections yet — skim those.
"SQL basics select insert where" — you only need reading-level SQL (what a table, row, column, and WHERE status = 'approved' mean). 15–30 min is enough; Supabase's dashboard writes most SQL for you.
Before Phase 2 (write path)
"React forms controlled components" — how form inputs tie to state and what happens on submit. You've already seen a controlled input in your own SearchBar.tsx; this generalizes it to a multi-field form.
"Supabase Row Level Security explained" — the security concept your whole design hinges on (why the public key must be read-only). Watch this before writing any policy.
"Supabase Edge Functions tutorial" — what they are (a small script Supabase runs on its servers), how to write and deploy one, and the anon-key vs service-role-key distinction. Note: they run on Deno, which looks almost exactly like the Node JavaScript you know — don't let that throw you.
Before Phase 3 (automation) — can wait
"Cloudflare Turnstile tutorial" and rate limiting are small, self-contained topics — learn them when you get there, not now.
For the Claude API call, skip YouTube; the Anthropic docs quickstart is short, and I can walk you through that part when we build it.