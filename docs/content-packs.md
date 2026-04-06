# Content Pack Packaging (C10)

Content bundles for questions, polls, items, etc. instead of scattered seed files.

## Folder structure

```
content-packs/
  <packKey>/
    manifest.json
    questions.jsonl   # for flow-questions type
    polls.jsonl      # for polls type
    items.jsonl      # optional, for items type
```

## Manifest fields

| Field | Required | Description |
|-------|----------|-------------|
| packKey | yes | Stable identifier, matches folder name |
| version | yes | Pack content revision (semver or simple) |
| type | yes | `flow-questions`, `polls`, `items` |
| title | no | Human title |
| description | no | Optional description |
| schemaVersion | yes | Loader compatibility (integer, currently 1) |
| createdAt | no | ISO date or string |
| source | no | Provenance note |

## Versioning rules

- **schemaVersion:** Changes when file format or record shape changes. Loader must support it.
- **version:** Changes when content (questions, polls, etc.) is edited.
- **packKey:** Stable. Do not rename; use new pack for new content.

## Supported file types

- **manifest.json** — Pack metadata (JSON).
- **questions.jsonl** — One FlowQuestion record per line (for `flow-questions` type).
- **polls.jsonl** — One Poll record per line (for `polls` type).

JSONL = one JSON object per line, no trailing comma.

## Example: flow-questions

**manifest.json:**
```json
{
  "packKey": "starter",
  "version": "1.0.0",
  "type": "flow-questions",
  "title": "Starter Flow",
  "schemaVersion": 1
}
```

**questions.jsonl:**
```jsonl
{"id":"q-01","text":"Question?","type":"SINGLE_CHOICE","opts":[{"label":"A","value":"a","order":0}]}
{"id":"q-02","text":"How many?","type":"NUMERIC"}
```

## Example: polls

**manifest.json:**
```json
{
  "packKey": "alpha-feedback-v01",
  "version": "1.0.0",
  "type": "polls",
  "title": "Alpha Feedback – v0.1",
  "schemaVersion": 1
}
```

**polls.jsonl:**
```jsonl
{"question":"Did you understand?","options":["Yes","No"],"allowFreetext":false}
{"question":"Any feedback?","options":[],"allowFreetext":true}
```

## Loader API

Located in `packages/db/content`:

```ts
import {
  loadPackManifest,
  loadQuestionsFromPack,
  loadPollsFromPack,
  resolvePackPath,
  loadContentPack,
} from '@parel/db/content';
```

- `loadPackManifest(packPath)` — Read manifest only.
- `loadQuestionsFromPack(packPath)` — Load questions.jsonl for flow-questions pack.
- `loadPollsFromPack(packPath)` — Load polls.jsonl for polls pack.
- `resolvePackPath(packKey)` — Resolve pack dir (default: `content-packs/<packKey>` under `process.cwd()`).
- `loadContentPack(packKey, loader)` — Load manifest + records via custom loader.

## Adding a new pack

1. Create `content-packs/<packKey>/` with `manifest.json`.
2. Add content files (`questions.jsonl`, `polls.jsonl`, etc.) per type.
3. Wire the pack into the seed script that needs it (e.g. `ensureStarterFlow`, `ensureAlphaFeedbackPoll`).
4. Run seed from repo root: `pnpm db:seed:world`.

## Environment

- `CONTENT_PACKS_DIR` — Override base dir (default: `content-packs` relative to cwd).
- Packs are resolved from repo root when running `pnpm db:seed:world`.
