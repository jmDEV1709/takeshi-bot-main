import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { TEMP_DIR } from "../config.js";

const execFileAsync = promisify(execFile);

function isUrl(value) {
  return /^https?:\/\//i.test(value);
}

export async function resolveYouTubeUrl(query) {
  if (isUrl(query)) {
    return query;
  }

  return `ytsearch1:${query}`;
}

function getYtDlpBinary() {
  if (process.env.YTDLP_PATH) {
    return process.env.YTDLP_PATH;
  }

  const localBinary = path.resolve(process.cwd(), ".bin", "yt-dlp");
  return fs.existsSync(localBinary) ? localBinary : "yt-dlp";
}

function findCookiesFile() {
  const cookieCandidates = [
    process.env.YTDLP_COOKIES_FILE,
    path.resolve(process.cwd(), "cookies", "cookies.txt"),
    path.resolve(process.cwd(), "cookies.txt"),
    path.resolve(TEMP_DIR, "..", "..", "cookies", "cookies.txt"),
    "/app/cookies/cookies.txt",
  ].filter(Boolean);

  return cookieCandidates.find((cookieFile) => {
    try {
      const stats = fs.statSync(cookieFile);
      return stats.isFile() && stats.size > 0;
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ENOTDIR") {
        throw error;
      }

      return false;
    }
  });
}

function getDownloadError(error, mediaType) {
  const details = `${error.message || ""}\n${error.stderr || ""}`;

  if (/no results|video unavailable/i.test(details)) {
    return new Error("SEARCH_NO_RESULTS");
  }

  if (
    /sign in|not a bot|confirm you.re not a bot|login required|authentication|po token/i.test(
      details,
    )
  ) {
    return new Error("YOUTUBE_AUTH_REQUIRED");
  }

  if (
    /requested format|audio format|video formats|format is not available/i.test(
      details,
    )
  ) {
    return new Error(
      mediaType === "audio" ? "AUDIO_FORMAT_NOT_FOUND" : "VIDEO_FORMAT_NOT_FOUND",
    );
  }

  if (error.code === "ENOENT") {
    return new Error("YTDLP_NOT_FOUND");
  }

  return error;
}

async function downloadYouTubeMedia(url, mediaType) {
  await fs.promises.mkdir(TEMP_DIR, { recursive: true });
  const outputDir = await fs.promises.mkdtemp(
    path.join(TEMP_DIR, "play-"),
  );
  const outputTemplate = path.join(outputDir, "%(id)s.%(ext)s");
  const ytDlpArgs = [
    "--no-playlist",
    "--no-warnings",
    "--no-progress",
    "--max-downloads",
    "1",
    "--output",
    outputTemplate,
  ];

  if (mediaType === "audio") {
    ytDlpArgs.push(
      "--extract-audio",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
    );
  } else {
    ytDlpArgs.push(
      "--format",
      "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b",
      "--merge-output-format",
      "mp4",
    );
  }

  const cookiesFile = findCookiesFile();
  if (cookiesFile) {
    ytDlpArgs.unshift("--cookies", cookiesFile);
  }

  ytDlpArgs.push(url);

  try {
    await execFileAsync(
      getYtDlpBinary(),
      ytDlpArgs,
      { maxBuffer: 1024 * 1024 },
    );

    const expectedExtensions =
      mediaType === "audio" ? [".mp3"] : [".mp4", ".mkv", ".webm"];
    const files = (await fs.promises.readdir(outputDir)).filter((file) =>
      expectedExtensions.some((extension) => file.endsWith(extension)),
    );
    if (!files.length) {
      throw new Error(
        mediaType === "audio" ? "AUDIO_NOT_FOUND" : "VIDEO_NOT_FOUND",
      );
    }

    return { outputPath: path.join(outputDir, files[0]), outputDir };
  } catch (error) {
    await fs.promises.rm(outputDir, { recursive: true, force: true });
    throw getDownloadError(error, mediaType);
  }
}

export async function downloadYouTubeAudio(url) {
  return downloadYouTubeMedia(url, "audio");
}

export async function downloadYouTubeVideo(url) {
  return downloadYouTubeMedia(url, "video");
}
