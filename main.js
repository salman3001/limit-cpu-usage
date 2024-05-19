import { spawn } from "child_process";

// Function to execute the bash script with CPU limit
function executeBashScript(cpuLimitPercentage) {
  return new Promise((resolve, reject) => {
    const scriptPath = "./start_worker.sh"; // Replace this with the path to your bash script
    const command = `${scriptPath} ${cpuLimitPercentage * 1000}`;

    const childProcess = spawn("bash", ["-c", command]);

    // Capture stdout and stderr streams
    childProcess.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    childProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    // Handle process exit
    childProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Bash script execution failed with code ${code}`));
      }
    });
  });
}

// Usage: node execute_script.js <cpu_limit_percentage>
const cpuLimitPercentage = process.argv[2]; // Get CPU limit percentage from command-line argument

if (
  !cpuLimitPercentage ||
  isNaN(cpuLimitPercentage) ||
  cpuLimitPercentage < 1 ||
  cpuLimitPercentage > 500
) {
  console.error(
    "Invalid CPU limit percentage. Usage: node execute_script.js <cpu_limit_percentage>"
  );
  process.exit(1);
}

// Execute the bash script with the specified CPU limit percentage
executeBashScript(cpuLimitPercentage)
  .then(() => {
    console.log("Bash script executed successfully.");
  })
  .catch((error) => {
    console.error("Error executing bash script:", error);
  });
