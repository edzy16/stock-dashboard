const fs = require("node:fs");
const path = require("node:path");

const baseDir = path.join(
  __dirname,
  "..",
  "node_modules",
  "@deno",
  "shim-deno",
  "dist",
  "deno",
  "stable",
  "functions"
);

const writeIfMissing = (filename, content) => {
  const target = path.join(baseDir, filename);
  if (fs.existsSync(target)) return;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
  console.log(`Patched missing ${filename} at ${target}`);
};

writeIfMissing(
  "fstatSync.js",
  `"use strict";
// Added by patch-deno-shim.js because shim 0.18.x misses fstatSync
const { fstatSync } = require("node:fs");
exports.fstatSync = fstatSync;
`
);

writeIfMissing(
  "read.js",
  `"use strict";
// Added by patch-deno-shim.js because shim 0.18.x misses read (async)
const fs = require("node:fs");
exports.read = (fd, buffer) =>
  new Promise((resolve, reject) => {
    fs.read(fd, buffer, 0, buffer.length, null, (err, bytesRead) => {
      if (err) return reject(err);
      resolve(bytesRead === 0 ? null : bytesRead);
    });
  });
`
);

writeIfMissing(
  "loadavg.js",
  `"use strict";
// Added by patch-deno-shim.js because shim 0.18.x misses loadavg
const os = require("node:os");
exports.loadavg = os.loadavg;
`
);

writeIfMissing(
  "makeTempFileSync.js",
  `"use strict";
// Added by patch-deno-shim.js because shim 0.18.x misses makeTempFileSync
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
exports.makeTempFileSync = (options = {}) => {
  const prefix = options.prefix ?? "deno-";
  const suffix = options.suffix ?? "";
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const filePath = path.join(dir, "tmp" + suffix);
  const fd = fs.openSync(filePath, "w");
  fs.closeSync(fd);
  return filePath;
};
`
);

writeIfMissing(
  "open.js",
  `"use strict";
// Added by patch-deno-shim.js because shim 0.18.x misses open (async)
const fs = require("node:fs");
exports.open = (path, options = { read: true, write: false, append: false, truncate: false, create: false }) => {
  const flags =
    options.read && options.write
      ? "r+"
      : options.write
        ? options.append
          ? "a"
          : options.truncate
            ? "w"
            : "w"
        : "r";
  return new Promise((resolve, reject) => {
    fs.open(path, flags, (err, fd) => {
      if (err) return reject(err);
      resolve(fd);
    });
  });
};
`
);

writeIfMissing(
  "openSync.js",
  `"use strict";
// Added by patch-deno-shim.js because shim 0.18.x misses openSync
const fs = require("node:fs");
exports.openSync = (path, options = { read: true, write: false, append: false, truncate: false, create: false }) => {
  const flags =
    options.read && options.write
      ? "r+"
      : options.write
        ? options.append
          ? "a"
          : options.truncate
            ? "w"
            : "w"
        : "r";
  return fs.openSync(path, flags);
};
`
);

writeIfMissing(
  "osRelease.js",
  `"use strict";
// Added by patch-deno-shim.js because shim 0.18.x misses osRelease
const os = require("node:os");
exports.osRelease = os.release;
`
);

writeIfMissing(
  "osUptime.js",
  `"use strict";
// Added by patch-deno-shim.js to ensure osUptime exists
const os = require("node:os");
exports.osUptime = os.uptime;
`
);

writeIfMissing(
  "readDir.js",
  `"use strict";
// Added by patch-deno-shim.js because shim 0.18.x misses readDir (async)
const fs = require("node:fs");
exports.readDir = async function* (path) {
  const dir = await fs.promises.opendir(path);
  for await (const dirent of dir) {
    yield {
      name: dirent.name,
      isFile: dirent.isFile(),
      isDirectory: dirent.isDirectory(),
      isSymlink: dirent.isSymbolicLink(),
    };
  }
};
`
);

writeIfMissing(
  "readDirSync.js",
  `"use strict";
// Added by patch-deno-shim.js because shim 0.18.x misses readDirSync
const fs = require("node:fs");
exports.readDirSync = function* (path) {
  const entries = fs.readdirSync(path, { withFileTypes: true });
  for (const dirent of entries) {
    yield {
      name: dirent.name,
      isFile: dirent.isFile(),
      isDirectory: dirent.isDirectory(),
      isSymlink: dirent.isSymbolicLink(),
    };
  }
};
`
);

writeIfMissing(
  "readFile.js",
  `"use strict";
// Added by patch-deno-shim.js because shim 0.18.x misses readFile (async)
const fs = require("node:fs");
exports.readFile = (path, options = {}) => fs.promises.readFile(path, options);
`
);

writeIfMissing(
  "readFileSync.js",
  `"use strict";
// Added by patch-deno-shim.js because shim 0.18.x misses readFileSync
const fs = require("node:fs");
exports.readFileSync = (path, options = {}) => fs.readFileSync(path, options);
`
);

writeIfMissing(
  "readLink.js",
  `"use strict";
// Added by patch-deno-shim.js because shim 0.18.x misses readLink (async)
const fs = require("node:fs");
exports.readLink = (path) => fs.promises.readlink(path);
`
);

