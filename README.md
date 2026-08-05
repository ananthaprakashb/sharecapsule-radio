# ShareCapsule Radio

ShareCapsule Radio is a morning-market audio interface and publication pipeline for `radio.sharecapsule.app`. It runs a 03:00 IST primary collection, a 05:45 IST Asian-market refresh and episode build, and a separate 06:15 IST publication gate.

## What is included

- Responsive online-FM interface with a browser narration fallback
- Versioned episode JSON contract and clearly labelled demo data
- Provider-neutral market-data and news collection endpoints
- Evidence archive for every pipeline run
- Podcast RSS generation guarded by a verified audio URL
- GitHub Actions schedules for primary collection, Asia refresh and validated publication
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

Copy the names in `.env.example` into GitHub Actions variables and secrets. Set `RADIO_MODE=production` only after the market-data, news, script-generation, TTS and audio-storage adapters return the normalized contract expected by `scripts/run-radio-pipeline.mjs`.

The default configuration keeps `autoPublish` disabled. A production episode must have a verified `audioUrl` before an RSS item is emitted.

## Hosting and DNS

Deploy the application to the selected host, add `radio.sharecapsule.app` as its custom domain, and create the host-provided `CNAME` or `A/AAAA` DNS record. Keep audio on durable object storage behind a CDN.

## Editorial safeguards

The pipeline is evidence-first: collection produces a source archive before narration is generated. Social and search signals may influence popularity but must not serve as the only source for a material claim. A fixed educational-purpose and listener-responsibility disclaimer is appended after script generation and before TTS, so a script provider cannot omit it. Financial commentary should be reviewed against applicable local requirements before enabling automatic publication.
