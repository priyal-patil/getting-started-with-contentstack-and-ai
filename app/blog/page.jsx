import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { contentstackImageSrc } from "@/lib/contentstack-image";
import { getEntriesPage } from "@/lib/contentstack";

const BLOG_POST_UID = "blog_post";
const PAGE_SIZE = 9;

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

function getPageFromSearchParams(searchParams) {
  const raw = searchParams.page;
  const v = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "1";
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const page = getPageFromSearchParams(sp);
  return {
    title: page > 1 ? `Blog — Page ${page}` : "Blog",
    description: "Latest posts",
  };
}

export default async function BlogPage({ searchParams }) {
  const sp = await searchParams;
  const page = getPageFromSearchParams(sp);
  const { entries, totalCount } = await getEntriesPage(BLOG_POST_UID, {
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / PAGE_SIZE);

  if (totalPages > 0 && page > totalPages) {
    redirect(totalPages === 1 ? "/blog" : `/blog?page=${totalPages}`);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 font-sans text-zinc-900 dark:text-zinc-100">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Blog</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">All posts from Contentstack.</p>
      </header>

      {entries.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">No posts yet.</p>
      ) : (
        <>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((post) => {
              const slug = typeof post.slug === "string" ? post.slug : "";
              const title = typeof post.title === "string" ? post.title : "Untitled";
              const coverUrl = getCoverImageUrl(post.cover_image);
              const dateLabel = formatPublishedDate(post.published_date);

              const cardInner = (
                <>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    {coverUrl ? (
                      <Image
                        src={contentstackImageSrc(coverUrl)}
                        alt=""
                        fill
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-zinc-400">No cover</div>
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
                    ) : (
                      <span className="mt-auto pt-2 text-sm text-zinc-500">Missing slug</span>
                    )}
                  </div>
                </>
              );

              return (
                <li key={post.uid ?? slug ?? title}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
                    {slug ? (
                      <Link href={`/blog/${encodeURIComponent(slug)}`} className="flex flex-1 flex-col">
                        {cardInner}
                      </Link>
                    ) : (
                      <div className="flex flex-1 flex-col">{cardInner}</div>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>

          {totalPages > 1 ? (
            <nav
              className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800"
              aria-label="Blog pagination"
            >
              {page > 1 ? (
                <Link
                  href={page === 2 ? "/blog" : `/blog?page=${page - 1}`}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-600">
                  Previous
                </span>
              )}

              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Page {page} of {totalPages}
              </span>

              {page < totalPages ? (
                <Link
                  href={`/blog?page=${page + 1}`}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-600">
                  Next
                </span>
              )}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
