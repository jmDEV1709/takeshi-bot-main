import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { TEMP_DIR } from "../config.js";
import { getRandomName } from "../utils/index.js";

const execFileAsync = promisify(execFile);
const YTDLP_BIN = process.env.YTDLP_PATH || "yt-dlp";

function isUrl(value) {
  return /^https?:\/\//i.test(value);
}

export async function resolveYouTubeUrl(query) {
  if (isUrl(query)) {
    return query;
  }

  return `ytsearch1:${query}`;
}

export async function downloadYouTubeAudio(url) {
  await fs.promises.mkdir(TEMP_DIR, { recursive: true });

  const outputPath = path.resolve(TEMP_DIR, getRandomName("m4a"));

  try {
    const ytDlpArgs = [
      "--no-playlist",
      "--no-warnings",
      "--no-progress",
      "--extract-audio",
      "--audio-format",
      "m4a",
      "--audio-quality",
      "5",
      "--extractor-args",
      "youtube:player_client=web_safari,android",
      "--output",
      outputPath,
      url,
    ];

    const cookieCandidates = [
      process.env.YTDLP_COOKIES_FILE,
      path.resolve(TEMP_DIR, "..", "..", "cookies", "cookies.txt"),
      path.resolve(TEMP_DIR, "..", "..", "cookies.txt"),
      "/app/cookies/cookies.txt",
    ].filter(Boolean);

    for (const cookieFile of cookieCandidates) {
      try {
        const cookieStats = await fs.promises.stat(cookieFile);
        if (cookieStats.isFile() && cookieStats.size > 0) {
          ytDlpArgs.splice(0, 0, "--cookies", cookieFile);
          break;
        }
      } catch (error) {
        if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
      }
    }

    await execFileAsync(
      YTDLP_BIN,
      ytDlpArgs,
      { maxBuffer: 1024 * 1024 },
    );

    return { outputPath };
  } catch (error) {
    await fs.promises.unlink(outputPath).catch(() => {});

    const details = `${error.message || ""}\n${error.stderr || ""}`;

    if (/no results|video unavailable/i.test(details)) {
      throw new Error("SEARCH_NO_RESULTS");
    }
    if (/requested format|audio format|no video formats/i.test(details)) {
      throw new Error("AUDIO_FORMAT_NOT_FOUND");
    }

    if (
      /sign in|not a bot|confirm you.re not a bot|login required|authentication|po token/i.test(
        details,
      )
    ) {
      throw new Error("YOUTUBE_AUTH_REQUIRED");
    }

    throw error;
  }
}
