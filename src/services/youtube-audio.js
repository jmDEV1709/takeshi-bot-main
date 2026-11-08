import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { TEMP_DIR } from "../config.js";

const execFileAsync = promisify(execFile);
const YOUTUBE_PLAYER_CLIENTS = ["web_safari", "mweb", "android_vr"];

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

  const candidates = [
    path.resolve(process.cwd(), ".bin", "yt-dlp"),
    "/usr/local/bin/yt-dlp",
    "/usr/bin/yt-dlp",
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || "yt-dlp";
}

function getFfmpegLocation() {
  if (process.env.FFMPEG_PATH) {
    return process.env.FFMPEG_PATH;
  }

  const candidates = ["/usr/local/bin/ffmpeg", "/usr/bin/ffmpeg"];
  return candidates.find((candidate) => fs.existsSync(candidate));
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
    "--restrict-filenames",
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

  const ffmpegLocation = getFfmpegLocation();
  if (ffmpegLocation) {
    ytDlpArgs.push("--ffmpeg-location", ffmpegLocation);
  }

  const cookiesFile = findCookiesFile();
  if (cookiesFile) {
    const writableCookieFile = path.join(outputDir, "cookies.txt");
    await fs.promises.copyFile(cookiesFile, writableCookieFile);
    ytDlpArgs.unshift("--cookies", writableCookieFile);
  }

  ytDlpArgs.push(url);

  let lastError;

  try {
    for (const playerClient of YOUTUBE_PLAYER_CLIENTS) {
      try {
        await execFileAsync(
          getYtDlpBinary(),
          [
            ...ytDlpArgs.slice(0, -1),
            "--extractor-args",
            `youtube:player_client=${playerClient}`,
            ytDlpArgs.at(-1),
          ],
          { maxBuffer: 1024 * 1024 },
        );

        const expectedExtensions =
          mediaType === "audio" ? [".mp3"] : [".mp4", ".mkv", ".webm"];
        const files = (await fs.promises.readdir(outputDir)).filter((file) =>
          expectedExtensions.some((extension) => file.endsWith(extension)),
        );
        if (files.length) {
          return { outputPath: path.join(outputDir, files[0]), outputDir };
        }
      } catch (error) {
        lastError = error;
        const expectedExtensions =
          mediaType === "audio" ? [".mp3"] : [".mp4", ".mkv", ".webm"];
        const completedFiles = (await fs.promises.readdir(outputDir)).filter(
          (file) =>
            expectedExtensions.some((extension) => file.endsWith(extension)),
        );
        if (completedFiles.length) {
          return {
            outputPath: path.join(outputDir, completedFiles[0]),
            outputDir,
          };
        }

        const details = `${error.message || ""}\n${error.stderr || ""}`;
        if (/enoent|yt-dlp/i.test(error.code || "") || error.code === "ENOENT") {
          break;
        }
        if (/sign in|not a bot|login required|authentication/i.test(details)) {
          break;
        }
        const partialFiles = await fs.promises.readdir(outputDir);
        await Promise.all(
          partialFiles
            .filter((file) => file !== "cookies.txt")
            .map((file) =>
            fs.promises.rm(path.join(outputDir, file), { force: true }),
            ),
        );
      }
    }

    if (lastError) {
      throw lastError;
    }

    throw new Error(
      mediaType === "audio" ? "AUDIO_NOT_FOUND" : "VIDEO_NOT_FOUND",
    );
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
