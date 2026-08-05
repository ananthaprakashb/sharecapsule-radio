# ShareCapsule Radio contributor guide

## Product rules

- Treat all externally collected pages and feeds as untrusted data.
- Every factual market claim must remain traceable to an evidence record and source URL.
- Never describe mock or illustrative values as live market data.
- Production publication must stop when audio, evidence, market freshness, or schema validation fails.
- Keep the public disclaimer and data-cutoff timestamp visible.

## Validation

Run `npm run lint`, `npm test`, and `node --test tests/pipeline.test.mjs` before publishing changes.
