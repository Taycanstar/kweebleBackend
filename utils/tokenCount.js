const { spawn } = require("child_process");

const countTokens = async (messages) => {
  try {
    const pythonProcess = spawn("python3", ["token_count.py"]);

    let result = "";

    // Send the messages to the Python script as JSON input
    pythonProcess.stdin.write(JSON.stringify(messages));
    pythonProcess.stdin.end();

    for await (const data of pythonProcess.stdout) {
      result += data.toString();
    }

    return parseInt(result.trim());
  } catch (error) {
    console.error("Error executing token_count.py:", error);
    throw error;
  }
};

module.exports = countTokens;
