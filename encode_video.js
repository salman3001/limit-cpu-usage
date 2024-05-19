import path from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import ffmpeg from "fluent-ffmpeg-7";
import { DOMParser, XMLSerializer } from "xmldom";

async function addBaseUrlToMpd(mpdFilePath, baseUrl) {
  const mpdText = readFileSync(mpdFilePath, "utf-8");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(mpdText, "application/xml");

  // Create BaseURL element
  const baseUrlElement = xmlDoc.createElement("BaseURL");
  baseUrlElement.textContent = baseUrl;

  // Append BaseURL to the MPD
  const mpdElement = xmlDoc.getElementsByTagName("MPD")[0];
  mpdElement.insertBefore(baseUrlElement, mpdElement.firstChild);

  const serializer = new XMLSerializer();
  const modifiedMpdText = serializer.serializeToString(xmlDoc);

  writeFileSync(mpdFilePath, modifiedMpdText);
}

export async function encodeVideo(
  inputPath,
  outputPath,
  bitrate,
  resolution,
  outputDir,
  chunkPrefix
) {
  const ffmpegBinPath =
    process.platform === "win32"
      ? "C:\\ffmpeg\\bin\\ffmpeg.exe" // Windows path
      : "/usr/bin/ffmpeg";

  ffmpeg.setFfmpegPath(ffmpegBinPath);

  return new Promise((resolve, reject) => {
    const initSegmentPath = `init-${chunkPrefix}-$RepresentationID$.mp4`; // Initialization segment path
    const mediaSegmentPath = `chunk-${chunkPrefix}-$RepresentationID$-$Number$.m4s`; // Segment output path

    // Ensure the output directory and chunks directory exist
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const outputOptions = [
      "-preset fast",
      "-keyint_min 50",
      "-g 50",
      "-sc_threshold 0",
      "-use_timeline 1",
      "-use_template 1",
      `-init_seg_name ${initSegmentPath}`,
      `-media_seg_name ${mediaSegmentPath}`,
      "-f dash",
      `-b:v ${bitrate}`,
      `-s ${resolution}`,
      // `-segment_list ${path.join(app.makePath('tmp'), outputDir)}`, // Specify segment list file
      "-segment_list_flags +live", // Enable live streaming mode
      "-segment_list_size 3", // Set maximum segment list size
      "-segment_list_type m3u8", // Specify segment list type
      // `-segment_list_entry_prefix ${path.join(app.makePath('tmp'), outputDir)}`, // Specify segment output path
    ];

    ffmpeg(inputPath)
      .outputOptions(outputOptions)
      .output(outputPath)
      .on("start", (commandLine) => {
        console.log("Spawned Ffmpeg with command:", commandLine);
      })
      .on("progress", (progress) => {
        // console.log('Processing:', progress);
      })
      .on("end", async () => {
        await addBaseUrlToMpd(outputPath, "http://localhost:3333/");
        resolve();
      })
      .on("error", (err, stdout, stderr) => {
        console.error("FFmpeg Error:", err);
        console.error("FFmpeg stdout:", stdout);
        console.error("FFmpeg stderr:", stderr);
        reject(err);
      })
      .run();
  });
}

// export async function uploadVideo(file) {
//   const tempFilePath = file?.tmpPath;
//   const baseFileName = `${Date.now().toString()}`;
//   const todayDate = new Date().toISOString().split("T")[0]; // Get today's date
//   // const outputDir = path.join(app.makePath(commonConfig.uploadPath), todayDate)
//   const outputDir = path.join("uploads", todayDate);
//   const videoFolder = path.join(outputDir, baseFileName);
//   const lowQualityOutputPath = path.join(videoFolder, `low.mpd`);
//   const mediumQualityOutputPath = path.join(videoFolder, `medium.mpd`);
//   const highQualityOutputPath = path.join(videoFolder, `high.mpd`);

//   // Ensure the output directory exists
//   if (!existsSync(outputDir)) {
//     mkdirSync(outputDir, { recursive: true });
//   }

//   try {
//     // Encode videos with absolute output paths
//     await Promise.all([
//       encodeVideo(
//         tempFilePath,
//         lowQualityOutputPath,
//         "500k",
//         "640x360",
//         videoFolder,
//         "low"
//       ),
//       encodeVideo(
//         tempFilePath,
//         mediumQualityOutputPath,
//         "1000k",
//         "1280x720",
//         videoFolder,
//         "medium"
//       ),
//       encodeVideo(
//         tempFilePath,
//         highQualityOutputPath,
//         "2000k",
//         "1920x1080",
//         videoFolder,
//         "high"
//       ),
//     ]);

//     // Construct relative path
//     // const relativePath = path.join('C:Intel\me\projects\video-project\tmp', videoFolder)
//     const relativePath = "";
//     // Normalize and replace backslashes with forward slashes
//     const normalizedPath = path.posix
//       .normalize(relativePath)
//       .replace(/\\/g, "/");
//     return normalizedPath;
//   } catch (error) {
//     throw error;
//   }
// }
