// Run the Eleventy dev server and the frontend watch build side by side,
// prefixing each process's output so it's clear which is which.
import { spawn } from "node:child_process";

function run(name, npmScript) {
  const child = spawn("npm", ["run", npmScript], { stdio: ["ignore", "pipe", "pipe"] });
  const prefix = (line) => `[${name}] ${line}`;

  for (const stream of [child.stdout, child.stderr]) {
    let buffer = "";
    stream.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        console.log(prefix(line));
      }
    });
  }

  child.on("exit", (code) => {
    console.log(prefix(`exited with code ${code}`));
  });

  return child;
}

run("serve", "serve");
run("fe", "fe");
