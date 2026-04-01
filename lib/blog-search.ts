const CDA_BASE = "https://cdn.contentstack.io/v3";
const BLOG_POST_UID = "blog_post";
const PAGE_SIZE = 100;

function getEnv(name: "CONTENTSTACK_API_KEY" | "CONTENTSTACK_DELIVERY_TOKEN" | "CONTENTSTACK_ENVIRONMENT") {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v;
}

/** Escape user input for safe use inside MongoDB-style `$regex` patterns. */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type CdaEntriesResponse = {
  entries?: Record<string, unknown>[];
};

async function fetchEntriesWithQuery(queryObj: object): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let skip = 0;

  while (true) {
    const url = new URL(`${CDA_BASE}/content_types/${BLOG_POST_UID}/entries`);
    url.searchParams.set("environment", getEnv("CONTENTSTACK_ENVIRONMENT"));
    url.searchParams.set("query", JSON.stringify(queryObj));
    url.searchParams.set("limit", String(PAGE_SIZE));
    url.searchParams.set("skip", String(skip));

    const res = await fetch(url.toString(), {
      headers: {
        api_key: getEnv("CONTENTSTACK_API_KEY"),
        access_token: getEnv("CONTENTSTACK_DELIVERY_TOKEN"),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Contentstack CDA error: ${res.status} ${res.statusText} ${errText}`);
    }

    const data = (await res.json()) as CdaEntriesResponse;
    const entries = data.entries ?? [];
    all.push(...entries);

    if (entries.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;
  }

  return all;
}

function dedupeByUid(entries: Record<string, unknown>[]): Record<string, unknown>[] {
  const seen = new Set<string>();
  const out: Record<string, unknown>[] = [];
  for (const e of entries) {
    const uid = typeof e.uid === "string" ? e.uid : JSON.stringify(e);
    if (seen.has(uid)) continue;
    seen.add(uid);
    out.push(e);
  }
  return out;
}

/**
 * Search `blog_post` entries where `title` or `body` matches the query (case-insensitive regex).
 * Uses `$or` with `$regex` on both fields. If that fails (e.g. body is JSON RTE and rejects regex),
 * falls back to title-only search, then merges separate title + body queries.
 */
export async function searchBlogPosts(searchQuery: string): Promise<Record<string, unknown>[]> {
  const trimmed = searchQuery.trim();
  if (!trimmed) {
    return [];
  }

  const escaped = escapeRegex(trimmed);

  const orQuery = {
    $or: [
      { title: { $regex: escaped, $options: "i" } },
      { body: { $regex: escaped, $options: "i" } },
    ],
  };

  try {
    return await fetchEntriesWithQuery(orQuery);
  } catch {
    // Combined query failed — try title-only, then body-only, merge.
    try {
      const byTitle = await fetchEntriesWithQuery({
        title: { $regex: escaped, $options: "i" },
      });
      let byBody: Record<string, unknown>[] = [];
      try {
        byBody = await fetchEntriesWithQuery({
          body: { $regex: escaped, $options: "i" },
        });
      } catch {
        /* body field may not support regex (e.g. JSON RTE) */
      }
      return dedupeByUid([...byTitle, ...byBody]);
    } catch {
      return [];
    }
  }
}
