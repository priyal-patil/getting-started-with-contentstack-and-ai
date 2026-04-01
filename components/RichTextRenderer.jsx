import { jsonToHtml } from "@contentstack/json-rte-serializer";
import sanitizeHtml from "sanitize-html";

/** Sanitizer tuned for typical JSON RTE HTML output (headings, lists, links, images, tables). */
const defaultSanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "img",
    "figure",
    "figcaption",
    "div",
    "span",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "blockquote",
    "code",
    "pre",
    "hr",
    "u",
    "s",
    "sub",
    "sup",
    "del",
    "ins",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ["href", "name", "target", "rel", "title"],
    img: ["src", "srcset", "alt", "title", "width", "height"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
    "*": ["class", "id"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
};

/**
 * Renders Contentstack JSON Rich Text Editor (JSON RTE) content as sanitized HTML.
 *
 * @param {object} props
 * @param {unknown} props.json — JSON RTE document (`{ type: "doc", ... }`) or legacy HTML string
 * @param {string} [props.className]
 * @param {import("@contentstack/json-rte-serializer").IJsonToHtmlOptions} [props.serializerOptions] — passed to `jsonToHtml`
 * @param {import("sanitize-html").IOptions} [props.sanitizeOptions] — merged over defaults for `sanitize-html`
 */
export function RichTextRenderer({ json, className, serializerOptions, sanitizeOptions }) {
  if (json == null) {
    return null;
  }

  let rawHtml = "";

  if (typeof json === "string") {
    rawHtml = json;
  } else if (typeof json === "object" && json !== null) {
    const doc = json;
    if (doc.type !== "doc") {
      return null;
    }
    try {
      rawHtml = jsonToHtml(doc, serializerOptions);
    } catch {
      return null;
    }
  } else {
    return null;
  }

  const mergedSanitize = sanitizeOptions
    ? { ...defaultSanitizeOptions, ...sanitizeOptions }
    : defaultSanitizeOptions;
  const sanitized = sanitizeHtml(rawHtml, mergedSanitize);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
