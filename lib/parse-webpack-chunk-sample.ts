import type {
  WebpackChunkGlobalVar,
  WebpackChunkSampleParseResult,
  WebpackChunkSampleParsed,
  WebpackParsedModule,
} from "@/types/webpack-chunk-sample";

const TRAILING_PROMPT =
  /\nWrite a TypeScript type definition[\s\S]*$/i;

function stripTrailingPrompt(input: string): string {
  return input.replace(TRAILING_PROMPT, "").trimEnd();
}

const GLOBAL_RE =
  /\((?:self|window)\.(webpackChunk\w+)=\1\|\|\[\]\)\.push\(/;

const CHUNK_IDS_RE = /\.push\(\[\[([^\]]*)\]\],\s*\{/;

const MODULE_START_RE = /(\d+):\(e,t,n\)=>/g;

/**
 * Parses a pasted Webpack JSONP chunk (e.g. `self.webpackChunkvenus.push([[5264],{...}]);`).
 * Returns an error if the string does not match the expected shape.
 */
export function parseWebpackChunkSample(
  input: string,
): WebpackChunkSampleParseResult {
  const raw = stripTrailingPrompt(input);

  const globalMatch = raw.match(GLOBAL_RE);
  if (!globalMatch) {
    return {
      kind: "error",
      message:
        "Expected a Webpack chunk assignment such as (self.webpackChunkname=…||[]).push(…).",
    };
  }

  const globalVarName = globalMatch[1] as WebpackChunkGlobalVar;

  const chunkMatch = raw.match(CHUNK_IDS_RE);
  if (!chunkMatch) {
    return {
      kind: "error",
      message: "Could not read chunk ids from .push([[…],{…}).",
    };
  }

  const chunkIds = chunkMatch[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s));

  const modStarts = [...raw.matchAll(MODULE_START_RE)];
  if (modStarts.length === 0) {
    return {
      kind: "error",
      message:
        "No webpack modules found (expected numeric ids with pattern:(e,t,n)=>).",
    };
  }

  const modules: WebpackParsedModule[] = [];
  for (let i = 0; i < modStarts.length; i++) {
    const id = modStarts[i][1]!;
    const start = modStarts[i].index!;
    const end =
      i + 1 < modStarts.length
        ? modStarts[i + 1].index!
        : raw.endsWith("}]);")
          ? raw.length - 4
          : raw.length;
    let factorySource = raw.slice(start, end);
    if (i < modStarts.length - 1) {
      factorySource = factorySource.replace(/,\s*$/, "");
    }
    modules.push({
      id,
      factorySource,
      byteLength: factorySource.length,
    });
  }

  const parsed: WebpackChunkSampleParsed = {
    globalVarName,
    chunkIds,
    modules,
    rawByteLength: raw.length,
    raw,
  };

  return parsed;
}
