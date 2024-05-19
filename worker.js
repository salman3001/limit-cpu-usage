import path from "node:path";
import { encodeVideo } from "./encode_video.js";
// import { applyCpuLimit } from "./apply_cpu_limit.js";
import { existsSync, mkdirSync } from "node:fs";

// applyCpuLimit(process.pid, 5);

function processJob(jobData) {
  return new Promise((resolve, reject) => {
    // Placeholder for the actual job logic
    console.log(`Processing job: ${JSON.stringify(jobData)}`);
    const outputPath = path.join(jobData.outputDir, "main.mpd");

    encodeVideo(
      jobData.videoFile,
      outputPath,
      "1000k",
      "1280x720",
      jobData.outputDir,
      "medium"
    )
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function startProcessing(jobData) {
  try {
    await processJob(jobData);
    console.log("Video encoding completed successfully.");
    // parentPort.postMessage({ success: true, jobId: jobData.jobId });
  } catch (error) {
    console.error("Error encoding video:", error);
    // parentPort.postMessage({ success: false, jobId: jobData.jobId });
  } finally {
    process.exit();
  }
}

const videoFile = path.join("input", "sample.mp4");
const outDir = path.join(".", "output", Date.now().toString());
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

startProcessing({
  jobId: Date.now().toString(),
  outputDir: outDir,
  videoFile,
});
