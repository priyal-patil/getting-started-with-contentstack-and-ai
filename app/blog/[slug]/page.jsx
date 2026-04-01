import Image from "next/image";
import { notFound } from "next/navigation";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import { contentstackImageSrc } from "@/lib/contentstack-image";
import { getEntries } from "@/lib/contentstack";
import { getBlogPostBySlug } from "@/lib/blog-post";

const BLOG_POST_UID = "blog_post";

export async function generateStaticParams() {
  const entries = await getEntries(BLOG_POST_UID);
  return entries
    .filter((e) => typeof e.slug === "string" && e.slug.length > 0)
    .map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return { title: "Post not found" };
  }
  return {
    title: post.title,
    description: post.title,
  };
}

function formatPublishedDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
  }).format(d);
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const dateLabel = formatPublishedDate(post.published_date);

  return (
    <article className="flex w-full flex-col gap-8 font-sans text-zinc-900 dark:text-zinc-100">
      <header className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 pt-12">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
        {dateLabel ? (
          <time className="text-sm text-zinc-500 dark:text-zinc-400" dateTime={post.published_date}>
            {dateLabel}
          </time>
        ) : null}
      </header>

      {post.coverImageUrl ? (
        <figure className="relative aspect-[21/9] w-full max-h-[70vh] min-h-[200px]">
          <Image
            src={contentstackImageSrc(post.coverImageUrl)}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </figure>
      ) : null}

      <RichTextRenderer
        json={post.body}
        className="mx-auto w-full max-w-3xl px-6 pb-12 text-base leading-relaxed text-zinc-800 dark:text-zinc-200 [&_p]:mb-4 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-zinc-900 [&_a]:underline dark:[&_a]:text-zinc-100"
      />
    </article>
  );
}
