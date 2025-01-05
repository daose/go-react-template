import { renderToString } from "react-dom/server";
import { App } from "./client/app.tsx";
import * as esbuild from "npm:esbuild";
/// <reference types="npm:@types/node" />
import { brotliCompress } from "node:zlib";
import { promisify } from "node:util";

const brotliCompressAsync = promisify(brotliCompress);

if (import.meta.main) {
  const [indexPath, appPath, stylePath] = Deno.args;
  await Promise.all([
    Deno.writeTextFile(
      indexPath,
      `<!doctype html>${renderToString(App())}`,
    ),
    esbuild.build({
      entryPoints: ["site/client/index.tsx"],
      bundle: true,
      minify: true,
      jsx: "automatic",
      outfile: appPath,
    }),
    esbuild.build({
      entryPoints: ["site/client/styles.css"],
      bundle: true,
      minify: true,
      outfile: stylePath,
    }),
  ]);
  console.log("Files generated, now compressing");
  const jobs = [];
  for (const path of Deno.args) {
    if (
      [".js", ".html", ".css"].some((suffix) => path.endsWith(suffix))
    ) {
      jobs.push(
        Deno.readTextFile(path).then((content) => brotliCompressAsync(content))
          .then((buf) => {
            Deno.writeFile(path, buf);
          }),
      );
    }
  }
  await Promise.all(jobs);
  console.log("Done");
}
