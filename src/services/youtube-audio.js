import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ytSearch from "yt-search";
import { TEMP_DIR } from "../config.js";
import { getRandomName } from "../utils/index.js";

const execFileAsync = promisify(execFile);
const MAX_AUDIO_SIZE = 25 * 1024 * 1024;
const COOKIES_FILE =
  process.env.YTDLP_COOKIES_FILE || "/app/cookies/cookies.txt";

function isUrl(value) {
  return /^https?:\/\//i.test(value);
}

export async function resolveYouTubeUrl(query) {
  if (isUrl(query)) {
    return query;
  }

  const result = await ytSearch(query);
  const firstVideo = result.videos?.[0];

  if (!firstVideo?.url) {
    throw new Error("SEARCH_NO_RESULTS");
  }

  return firstVideo.url;
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
      "--max-filesize",
      `${MAX_AUDIO_SIZE}`,
      "--output",
      outputPath,
      url,
    ];

    try {
      const cookieStats = await fs.promises.stat(COOKIES_FILE);
      if (cookieStats.isFile() && cookieStats.size > 0) {
        ytDlpArgs.splice(0, 0, "--cookies", COOKIES_FILE);
      }
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ENOTDIR") {
        throw error;
      }
    }

    await execFileAsync(
      "yt-dlp",
      ytDlpArgs,
      { maxBuffer: 1024 * 1024 },
    );

    const stats = await fs.promises.stat(outputPath);

    if (stats.size > MAX_AUDIO_SIZE) {
      throw new Error("FILE_TOO_LARGE");
    }

    return { outputPath };
  } catch (error) {
    await fs.promises.unlink(outputPath).catch(() => {});

    const details = `${error.message || ""}\n${error.stderr || ""}`;

    if (/requested format|audio format|no video formats/i.test(details)) {
      throw new Error("AUDIO_FORMAT_NOT_FOUND");
    }

    if (/max-filesize|file is larger|exceeds the maximum/i.test(details)) {
      throw new Error("FILE_TOO_LARGE");
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

export { MAX_AUDIO_SIZE };
