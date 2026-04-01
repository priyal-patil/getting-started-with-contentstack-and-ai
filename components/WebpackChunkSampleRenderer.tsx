import { parseWebpackChunkSample } from "@/lib/parse-webpack-chunk-sample";
import type { WebpackChunkSampleParseResult } from "@/types/webpack-chunk-sample";

function isError(
  r: WebpackChunkSampleParseResult,
): r is Extract<WebpackChunkSampleParseResult, { kind: "error" }> {
  return "kind" in r && r.kind === "error";
}

type Props = {
  /** Full pasted string (Webpack JSONP chunk, often mislabeled as “JSON”). */
  raw: string;
  /** Max characters shown per module before truncation in the summary table. */
  previewChars?: number;
};

/**
 * Renders metadata and per-module previews for a Webpack `*.push([[chunkIds],{modules}])` blob.
 * Use this when the “API response” is actually a compiled chunk, not Contentstack JSON.
 */
export function WebpackChunkSampleRenderer({
  raw,
  previewChars = 120,
}: Props) {
  const result = parseWebpackChunkSample(raw);

  if (isError(result)) {
    return (
      <div className="rounded-lg border border-amber-700/50 bg-amber-950/30 p-4 text-sm">
        <p className="font-medium text-amber-200">Could not parse as Webpack chunk</p>
        <p className="mt-2 text-amber-100/90">{result.message}</p>
      </div>
    );
  }

  const { globalVarName, chunkIds, modules, rawByteLength } = result;

  return (
    <div className="space-y-6 text-sm">
      <div className="rounded-lg border border-zinc-700 bg-zinc-900/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Not Contentstack entry JSON
        </p>
        <p className="mt-2 text-zinc-200">
          This payload is a{" "}
          <span className="font-mono text-emerald-300">Webpack JSONP chunk</span>{" "}
          (compiled modules), not a blog_post from the Content Delivery API.
        </p>
      </div>

      <dl className="grid gap-2 rounded-lg border border-zinc-700 bg-zinc-950/50 p-4 font-mono text-xs sm:grid-cols-2">
        <dt className="text-zinc-500">Global</dt>
        <dd className="text-zinc-200">{globalVarName}</dd>
        <dt className="text-zinc-500">Chunk ids</dt>
        <dd className="text-zinc-200">{chunkIds.join(", ")}</dd>
        <dt className="text-zinc-500">Module count</dt>
        <dd className="text-zinc-200">{modules.length}</dd>
        <dt className="text-zinc-500">Raw size (chars)</dt>
        <dd className="text-zinc-200">{rawByteLength.toLocaleString()}</dd>
      </dl>

      <div className="overflow-x-auto rounded-lg border border-zinc-700">
        <table className="w-full min-w-[32rem] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-700 bg-zinc-900/80">
              <th className="px-3 py-2 font-medium text-zinc-400">Module id</th>
              <th className="px-3 py-2 font-medium text-zinc-400">Bytes</th>
              <th className="px-3 py-2 font-medium text-zinc-400">Preview</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.id} className="border-b border-zinc-800/80">
                <td className="px-3 py-2 align-top font-mono text-emerald-300">
                  {m.id}
                </td>
                <td className="px-3 py-2 align-top text-zinc-400">
                  {m.byteLength.toLocaleString()}
                </td>
                <td className="px-3 py-2 align-top font-mono text-zinc-300">
                  {m.factorySource.length > previewChars
                    ? `${m.factorySource.slice(0, previewChars)}…`
                    : m.factorySource}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="rounded-lg border border-zinc-700 bg-zinc-950/50">
        <summary className="cursor-pointer px-4 py-3 text-xs font-medium text-zinc-400">
          Full raw chunk (large)
        </summary>
        <pre className="max-h-[min(70vh,48rem)] overflow-auto border-t border-zinc-800 p-4 text-[11px] leading-relaxed text-zinc-300">
          {result.raw}
        </pre>
      </details>
    </div>
  );
}
