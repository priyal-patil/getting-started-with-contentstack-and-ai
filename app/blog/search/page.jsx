import Image from "next/image";
import Link from "next/link";
import { contentstackImageSrc } from "@/lib/contentstack-image";
import { searchBlogPosts } from "@/lib/blog-search";

function getCoverImageUrl(cover) {
  if (!cover || typeof cover !== "object") return null;
  if (typeof cover.url === "string") return cover.url;
  return null;
}

function formatPublishedDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
  }).format(d);
}

function getSearchParam(searchParams, key) {
  const v = searchParams[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const q = getSearchParam(sp, "q");
  return {
    title: q ? `Search: ${q}` : "Search blog",
    description: "Search blog posts",
  };
}

export default async function BlogSearchPage({ searchParams }) {
  const sp = await searchParams;
  const q = getSearchParam(sp, "q").trim();
  const results = q ? await searchBlogPosts(q) : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 font-sans text-zinc-900 dark:text-zinc-100">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Search</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Find posts by title or body.
        </p>
      </header>

      <form
        action="/blog/search"
        method="get"
        className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center"
        role="search"
      >
        <label htmlFor="blog-search-q" className="sr-only">
          Search query
        </label>
        <input
          id="blog-search-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search posts…"
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 shadow-sm outline-none ring-zinc-400 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
          autoComplete="off"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Search
        </button>
      </form>

      {!q ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          Enter a search term above to find posts.
        </p>
      ) : results.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No posts found for &ldquo;{q}&rdquo;.
        </p>
      ) : (
        <>
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
          </p>
          <ul className="flex flex-col gap-6">
            {results.map((post) => {
              const slug = typeof post.slug === "string" ? post.slug : "";
              const title = typeof post.title === "string" ? post.title : "Untitled";
              const coverUrl = getCoverImageUrl(post.cover_image);
              const dateLabel = formatPublishedDate(post.published_date);

              const cardInner = (
                <article className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 sm:flex-row">
                  <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900 sm:aspect-auto sm:h-[180px] sm:w-44">
                    {coverUrl ? (
                      <Image
                        src={contentstackImageSrc(coverUrl)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 176px"
                      />
                    ) : (
                      <div className="flex h-full min-h-[140px] items-center justify-center text-sm text-zinc-400 sm:min-h-[180px]">
                        No cover
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h2 className="text-lg font-semibold leading-snug text-zinc-900 group-hover:underline dark:text-zinc-50">
                      {title}
                    </h2>
                    {dateLabel ? (
                      <time
                        className="text-sm text-zinc-500 dark:text-zinc-400"
                        dateTime={post.published_date}
                      >
                        {dateLabel}
                      </time>
                    ) : null}
                    {slug ? (
                      <span className="mt-auto pt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Read post →
                      </span>
                    ) : null}
                  </div>
                </article>
              );

              return (
                <li key={post.uid ?? slug ?? title}>
                  {slug ? (
                    <Link href={`/blog/${encodeURIComponent(slug)}`} className="block">
                      {cardInner}
                    </Link>
                  ) : (
                    cardInner
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
