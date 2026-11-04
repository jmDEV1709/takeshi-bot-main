import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import ytdl from "@distube/ytdl-core";
import ytSearch from "yt-search";
import { TEMP_DIR } from "../config.js";
import { getRandomName } from "../utils/index.js";

const MAX_AUDIO_SIZE = 25 * 1024 * 1024;

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

  const info = await ytdl.getInfo(url);
  const format =
    ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: (candidate) =>
        candidate.hasAudio &&
        !candidate.hasVideo &&
        ["mp4", "m4a"].includes(candidate.container),
    }) ||
    ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
    });

  if (!format?.url) {
    throw new Error("AUDIO_FORMAT_NOT_FOUND");
  }

  const contentLength = Number(format.contentLength || 0);

  if (contentLength && contentLength > MAX_AUDIO_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }

  const outputPath = path.resolve(TEMP_DIR, getRandomName(format.container || "m4a"));
  const audioStream = ytdl.downloadFromInfo(info, {
    format,
    highWaterMark: 1 << 20,
  });
  let downloadedSize = 0;

  audioStream.on("data", (chunk) => {
    downloadedSize += chunk.length;

    if (downloadedSize > MAX_AUDIO_SIZE) {
      audioStream.destroy(new Error("FILE_TOO_LARGE"));
    }
  });

  try {
    await pipeline(audioStream, fs.createWriteStream(outputPath));
    return { info, format, outputPath };
  } catch (error) {
    await fs.promises.unlink(outputPath).catch(() => {});
    throw error;
  }
}

export { MAX_AUDIO_SIZE };
