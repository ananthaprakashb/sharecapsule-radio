# ShareCapsule Radio

ShareCapsule Radio is a U.S.-market audio interface and publication pipeline for `radio.sharecapsule.app`. It collects data at 03:00 America/Los_Angeles local time, prepares the episode at 03:15, and applies the publication gate at 03:30. The workflow follows Pacific daylight-saving changes automatically.

## What is included

- Responsive online-FM interface with a browser narration fallback
- Versioned episode JSON contract and clearly labelled demo data
- Provider-neutral market-data and news collection endpoints
- Evidence archive for every pipeline run
- Podcast RSS generation guarded by a verified audio URL
- GitHub Actions schedules for Pacific-time U.S. collection, episode preparation and validated publication
- CI checks for the site and publication contract
- Mandatory spoken and on-page educational-purpose disclaimer

## Local development

```bash
npm ci
npm run dev
```

Run the publication pipeline safely in mock mode:

```bash
RADIO_MODE=mock node scripts/run-radio-pipeline.mjs --stage=all
node --test tests/pipeline.test.mjs
```

## Production configuration

Copy the names in `.env.example` into GitHub Actions variables and secrets. Configure the market-data and news endpoints for U.S.-listed securities and the U.S. index universe in `config/publication.json`. Set `RADIO_MODE=production` only after the market-data, news, script-generation, TTS and audio-storage adapters return the normalized contract expected by `scripts/run-radio-pipeline.mjs`.

The default configuration keeps `autoPublish` disabled. A production episode must have a verified `audioUrl` before an RSS item is emitted.

## Hosting and DNS

Deploy the application to the selected host, add `radio.sharecapsule.app` as its custom domain, and create the host-provided `CNAME` or `A/AAAA` DNS record. Keep audio on durable object storage behind a CDN.

## Editorial safeguards

The pipeline is evidence-first: collection produces a source archive before narration is generated. Social and search signals may influence popularity but must not serve as the only source for a material claim. A fixed educational-purpose and listener-responsibility disclaimer is appended after script generation and before TTS, so a script provider cannot omit it. Financial commentary should be reviewed against applicable local requirements before enabling automatic publication.
