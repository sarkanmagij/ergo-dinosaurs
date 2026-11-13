<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Application rules
- Keep assessment state in the client and encode validated results in compressed URL fragments; v1 must not require storage or sign-in.
- Keep risk math and diagnosis templates in `src/lib/extinction-risk.ts` so scoring is transparent and independently testable.
- Keep optional storage SQL unapplied in `docs/`; no personal data is collected until a consented server handler is enabled.
- Dispatch lightweight analytics as `trex:analytics` custom events without emails; an external listener can be connected later.
- Keep stored and shared values (process names, industries, tiers) in canonical English and translate only at render time through `src/lib/i18n/` (`en`, `et`, `lv`, `lt`); every dictionary must satisfy the `Dict` type, and translated diagnosis copy is passed into `diagnose()` rather than duplicating its logic.
