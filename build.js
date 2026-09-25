const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");
const imageNames = ["image.jpg", "image.jpeg", "image.webp", "image.gif"];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "images"), { recursive: true });
fs.copyFileSync(path.join(root, "public", "index.html"), path.join(dist, "index.html"));

for (const name of imageNames) {
  const from = path.join(root, "images", name);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, path.join(dist, "images", name));
  }
}

console.log("Built dist/");
