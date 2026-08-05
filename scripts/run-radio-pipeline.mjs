import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const stage = process.argv.find((arg) => arg.startsWith("--stage="))?.split("=")[1] ?? "all";
const allowedStages = new Set(["primary", "refresh", "publish", "all"]);
const SPOKEN_DISCLAIMER =
  "ShareCapsule Radio is provided solely for educational and informational purposes. " +
  "Nothing in this broadcast is investment, financial, legal, or tax advice. " +
  "Listeners remain solely responsible for their financial decisions. " +
  "ShareCapsule Radio and its publishers are not responsible for decisions, trades, losses, " +
  "or other outcomes based on this broadcast. Please do your own research and consult a " +
  "qualified financial professional when appropriate.";

if (!allowedStages.has(stage)) {
  throw new Error(`Unknown stage: ${stage}`);
}

const config = JSON.parse(await readFile(path.join(root, "config/publication.json"), "utf8"));
const latestPath = path.join(root, "data/latest-episode.json");
const current = JSON.parse(await readFile(latestPath, "utf8"));
const mode = process.env.RADIO_MODE ?? "mock";
const now = new Date();
const dateParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: config.timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).formatToParts(now);
const part = (type) => dateParts.find((item) => item.type === type)?.value;
const episodeDate = `${part("year")}-${part("month")}-${part("day")}`;
const displayDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: config.timezone,
  day: "2-digit",
  month: "short",
  year: "numeric",
}).format(now).toUpperCase();

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required when RADIO_MODE=production`);
  return value;
};

const getJson = async (url, token) => {
  const marketFocus = config.marketFocus ?? {};
  const response = await fetch(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-ShareCapsule-Market": marketFocus.region ?? "US",
      "X-ShareCapsule-Indexes": (marketFocus.indexes ?? []).join(","),
      "X-ShareCapsule-Symbols": (marketFocus.prioritySymbols ?? []).join(","),
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Provider request failed with HTTP ${response.status}`);
  return response.json();
};

const postJson = async (url, token, body) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`Production adapter failed with HTTP ${response.status}`);
  return response.json();
};

const validateEpisode = (episode) => {
  const fields = ["episodeDate", "title", "dataCutoff", "narration", "markets", "drivers", "stocks"];
  for (const field of fields) {
    if (!episode[field]) throw new Error(`Episode is missing ${field}`);
  }
  if (!Array.isArray(episode.markets) || !Array.isArray(episode.stocks)) {
    throw new Error("markets and stocks must be arrays");
  }
  const narration = String(episode.narration).toLowerCase();
  if (
    !narration.includes("educational and informational purposes") ||
    !narration.includes("not responsible for decisions")
  ) {
    throw new Error("Episode narration is missing the mandatory spoken disclaimer");
  }
  if (episode.mode === "production" && !episode.audioUrl) {
    throw new Error("Production publication requires an audioUrl");
  }
};

const collectProduction = async () => {
  const [marketPayload, newsPayload] = await Promise.all([
    getJson(required("MARKET_DATA_URL"), process.env.MARKET_DATA_TOKEN),
    getJson(required("NEWS_FEED_URL"), process.env.NEWS_FEED_TOKEN),
  ]);
  return { marketPayload, newsPayload };
};

const writeEvidence = async (payload) => {
  const runDirectory = path.join(root, "data/runs", episodeDate);
  await mkdir(runDirectory, { recursive: true });
  await writeFile(
    path.join(runDirectory, "evidence.json"),
    `${JSON.stringify({ collectedAt: new Date().toISOString(), stage, ...payload }, null, 2)}\n`,
  );
};

const publishFeed = async (episode) => {
  if (!episode.audioUrl) {
    console.log("RSS item skipped: no verified audio URL is available.");
    return;
  }
  const baseUrl = process.env.PUBLICATION_BASE_URL ?? config.canonicalBaseUrl;
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ShareCapsule Radio</title>
    <link>${baseUrl}</link>
    <description>U.S. markets, active stocks and the global signals shaping the U.S. trading day.</description>
    <language>en-US</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <item>
      <guid isPermaLink="false">sharecapsule-radio-${episode.episodeDate}</guid>
      <title>${episode.title}</title>
      <link>${baseUrl}/episodes/${episode.episodeDate}</link>
      <description>${episode.summary}</description>
      <enclosure url="${episode.audioUrl}" type="audio/mpeg" length="0" />
    </item>
  </channel>
</rss>\n`;
  await writeFile(path.join(root, "public/feed.xml"), feed);
};

const buildProductionEpisode = async (evidence) => {
  const draft = await postJson(
    required("SCRIPT_GENERATOR_URL"),
    process.env.SCRIPT_GENERATOR_TOKEN,
    { evidence, publication: config, episodeDate },
  );
  const narration = `${String(draft.narration ?? "").trim()} ${SPOKEN_DISCLAIMER}`.trim();
  const audio = await postJson(
    required("TTS_URL"),
    process.env.TTS_TOKEN,
    { title: draft.title, narration, episodeDate },
  );
  if (!audio.audioUrl) throw new Error("TTS adapter did not return audioUrl");
  return { ...draft, ...audio, narration };
};

let next = {
  ...current,
  episodeDate,
  displayDate,
  generatedAt: now.toISOString(),
  mode,
};

if (stage === "primary" || stage === "all") {
  const evidence = mode === "production" ? await collectProduction() : {
    marketPayload: { status: "mock", items: current.markets },
    newsPayload: { status: "mock", items: current.drivers },
  };
  await writeEvidence(evidence);
  console.log(`Primary collection completed in ${mode} mode.`);
}

if (stage === "refresh" || stage === "all") {
  if (mode === "production") {
    const evidence = await collectProduction();
    await writeEvidence(evidence);
    next = {
      ...next,
      ...(await buildProductionEpisode(evidence)),
      episodeDate,
      displayDate,
      generatedAt: now.toISOString(),
      dataCutoff: `${config.episodeBuild} PT`,
      mode: "production",
    };
  } else {
    next = { ...next, dataCutoff: `${config.episodeBuild} PT` };
  }
  console.log("U.S. pre-market and global-context refresh completed.");
}

if (stage === "refresh" || stage === "all") {
  validateEpisode(next);
  await writeFile(latestPath, `${JSON.stringify(next, null, 2)}\n`);
}

if (stage === "publish" || stage === "all") {
  const publishable = stage === "publish"
    ? JSON.parse(await readFile(latestPath, "utf8"))
    : next;
  validateEpisode(publishable);
  await publishFeed(publishable);
  console.log(publishable.audioUrl ? "Publication artifacts created." : "Publication held at the audio quality gate.");
}
