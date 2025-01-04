import { renderToString } from "react-dom/server";
import { App } from "./client/app.tsx";
import * as esbuild from "npm:esbuild";
/// <reference types="npm:@types/node" />
import { brotliCompress } from "node:zlib";
import { promisify } from "node:util";

const brotliCompressAsync = promisify(brotliCompress);

if (import.meta.main) {
  try {
    Deno.removeSync("build", { recursive: true });
  } catch { /* clean complete */ }
  Deno.mkdirSync("build");
  await Promise.all([
    Deno.writeTextFile(
      "build/index.html",
      `<!doctype html>${renderToString(App())}`,
    ),
    esbuild.build({
      entryPoints: ["client/index.tsx"],
      bundle: true,
      minify: true,
      jsx: "automatic",
      outfile: "build/app.js",
    }),
    esbuild.build({
      entryPoints: ["client/styles.css"],
      bundle: true,
      minify: true,
      outfile: "build/styles.css",
    }),
  ]);
  console.log("Files generated, now compressing");
  const jobs = [];
  for (const dirEntry of Deno.readDirSync("build")) {
    if (dirEntry.isFile) {
      const fileName = dirEntry.name;
      if (
        [".js", ".html", ".css"].some((suffix) => fileName.endsWith(suffix))
      ) {
        jobs.push(
          Deno.readTextFile("build/" + fileName).then((content) =>
            brotliCompressAsync(content)
          ).then((buf) => {
            Deno.writeFile("build/" + fileName, buf);
          }),
        );
      }
    }
  }
  await Promise.all(jobs);
  console.log("Done");
}
