const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = 3001;
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");
const IMAGES = path.join(ROOT, "images");

const IMAGE_NAMES = ["image.jpg", "image.jpeg", "image.webp", "image.gif"];

const TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
};

function currentImage() {
  for (const name of IMAGE_NAMES) {
    if (fs.existsSync(path.join(IMAGES, name))) return name;
  }
  return null;
}

function lanAddresses() {
  const ips = [];
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const entry of entries || []) {
      const v4 = entry.family === "IPv4" || entry.family === 4;
      if (v4 && !entry.internal) ips.push(entry.address);
    }
  }
  return ips;
}

function sendFile(res, file, type) {
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": "no-store",
  });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://" + req.headers.host);

  if (url.pathname === "/api/image") {
    const name = currentImage();
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });
    res.end(JSON.stringify({ src: name ? "/images/" + name : null }));
    return;
  }

  if (url.pathname.startsWith("/images/")) {
    const name = path.basename(decodeURIComponent(url.pathname));
    const file = path.join(IMAGES, name);
    if (!IMAGE_NAMES.includes(name) || !fs.existsSync(file)) {
      res.writeHead(404);
      res.end();
      return;
    }
    sendFile(res, file, TYPES[path.extname(name).toLowerCase()]);
    return;
  }

  const rel = url.pathname === "/" ? "index.html" : path.normalize(url.pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  const file = path.join(PUBLIC, rel);
  if (!file.startsWith(PUBLIC) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(file).toLowerCase();
  sendFile(res, file, TYPES[ext] || "application/octet-stream");
});

fs.mkdirSync(IMAGES, { recursive: true });

server.listen(PORT, "0.0.0.0", () => {
  console.log("http://localhost:" + PORT);
  for (const ip of lanAddresses()) {
    console.log("http://" + ip + ":" + PORT);
  }
});
