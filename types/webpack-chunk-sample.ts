/**
 * Shape of a Webpack JSONP / "chunk" file: `(self|window).webpackChunk{Name}.push([[...chunkIds], { ...modules }])`.
 * This is **not** a Contentstack CDA entry; it is compiled JavaScript emitted by Webpack.
 */

/** Global array Webpack appends to, e.g. `webpackChunkvenus` */
export type WebpackChunkGlobalVar = `webpackChunk${string}`;

/** Serialized module factory as it appears in the bundle (normally a function; here a string slice). */
export type WebpackModuleFactorySource = string;

/**
 * Tuple Webpack passes to `chunk.push(...)`: `[chunkIdGroup, moduleMap]`.
 * The second element maps numeric module ids to factory sources.
 */
export type WebpackChunkPushTuple = readonly [
  chunkIds: readonly number[],
  modules: Readonly<Record<string, WebpackModuleFactorySource>>,
];

/** One module entry after parsing a sample string (factory source is a substring of the raw bundle). */
export type WebpackParsedModule = {
  id: string;
  factorySource: WebpackModuleFactorySource;
  byteLength: number;
};

/** Result of parsing a pasted Webpack chunk string. */
export type WebpackChunkSampleParsed = {
  /** e.g. `webpackChunkvenus` */
  globalVarName: WebpackChunkGlobalVar;
  chunkIds: readonly number[];
  modules: readonly WebpackParsedModule[];
  /** Total size of the trimmed raw string (bytes ≈ UTF-16 length for BMP text). */
  rawByteLength: number;
  /** Trimmed input (trailing user prompt removed when present). */
  raw: string;
};

export type WebpackChunkSampleParseError = {
  kind: "error";
  message: string;
};

export type WebpackChunkSampleParseResult =
  | WebpackChunkSampleParsed
  | WebpackChunkSampleParseError;
