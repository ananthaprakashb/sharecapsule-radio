import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("latest episode satisfies the publication contract", async () => {
  const episode = JSON.parse(await readFile("data/latest-episode.json", "utf8"));
  assert.equal(episode.schemaVersion, 1);
  assert.match(episode.episodeDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(episode.markets.length >= 4);
  assert.ok(episode.drivers.length >= 3);
  assert.ok(episode.stocks.length >= 3);
  assert.ok(episode.stocks.every((stock) => stock.score >= 0 && stock.score <= 100));
  assert.ok(episode.mode === "demo" || episode.mode === "mock" || episode.audioUrl);
  assert.match(episode.narration, /educational and informational purposes/i);
  assert.match(episode.narration, /not responsible for decisions/i);
});

test("publication configuration uses the intended U.S. Pacific schedule", async () => {
  const config = JSON.parse(await readFile("config/publication.json", "utf8"));
  assert.equal(config.timezone, "America/Los_Angeles");
  assert.equal(config.primaryCollection, "03:00");
  assert.equal(config.episodeBuild, "03:15");
  assert.equal(config.publishAt, "03:30");
  assert.equal(config.marketFocus.region, "US");
  assert.deepEqual(config.marketFocus.indexes, ["SPX", "NDX", "DJI", "RUT", "VIX"]);
  assert.ok(config.marketFocus.prioritySymbols.includes("NVDA"));
  assert.equal(config.canonicalBaseUrl, "https://radio.sharecapsule.app");
});

test("workflow supports both Pacific daylight and standard time", async () => {
  const workflow = await readFile(".github/workflows/radio-publication.yml", "utf8");
  assert.match(workflow, /0 10 \* \* \*/);
  assert.match(workflow, /0 11 \* \* \*/);
  assert.match(workflow, /TZ=America\/Los_Angeles/);
  assert.match(workflow, /expected_time="03:00"/);
});
