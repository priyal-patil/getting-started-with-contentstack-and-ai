const CDA_BASE = "https://cdn.contentstack.io/v3";
const BLOG_POST_UID = "blog_post";

type BlogPostEntry = {
  title: string;
  slug: string;
  body: string | Record<string, unknown>;
  cover_image?: unknown;
  published_date?: string;
};

export type BlogPostView = {
  title: string;
  slug: string;
  published_date?: string;
  /** JSON RTE document or legacy HTML string — use with `RichTextRenderer` */
  body: string | Record<string, unknown> | null;
  coverImageUrl: string | null;
};

function getEnv(name: "CONTENTSTACK_API_KEY" | "CONTENTSTACK_DELIVERY_TOKEN" | "CONTENTSTACK_ENVIRONMENT") {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

function getCoverImageUrl(cover: unknown): string | null {
  if (!cover || typeof cover !== "object") return null;
  const o = cover as Record<string, unknown>;
  if (typeof o.url === "string") return o.url;
  return null;
}

/**
 * Fetches a single blog_post entry by slug from the Contentstack Content Delivery API.
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPostView | null> {
  const query = JSON.stringify({ slug });
  const url = new URL(`${CDA_BASE}/content_types/${BLOG_POST_UID}/entries`);
  url.searchParams.set("environment", getEnv("CONTENTSTACK_ENVIRONMENT"));
  url.searchParams.set("query", query);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: {
      api_key: getEnv("CONTENTSTACK_API_KEY"),
      access_token: getEnv("CONTENTSTACK_DELIVERY_TOKEN"),
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Contentstack CDA error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { entries?: BlogPostEntry[] };
  const entry = data.entries?.[0];
  if (!entry) return null;

  const body = entry.body;
  const bodyNormalized: BlogPostView["body"] =
    body === undefined || body === null
      ? null
      : typeof body === "string" || typeof body === "object"
        ? body
        : null;

  return {
    title: entry.title,
    slug: entry.slug,
    published_date: entry.published_date,
    body: bodyNormalized,
    coverImageUrl: getCoverImageUrl(entry.cover_image),
  };
}
