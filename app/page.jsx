import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { contentstackImageSrc } from "@/lib/contentstack-image";
import { getEntries } from "@/lib/contentstack";

const HOMEPAGE_UID = "homepage";

function getHeroImageUrl(heroImage) {
  if (!heroImage || typeof heroImage !== "object") return null;
  if (typeof heroImage.url === "string") return heroImage.url;
  return null;
}

const getHomepage = cache(async () => {
  try {
    const entries = await getEntries(HOMEPAGE_UID);
    return entries[0] ?? null;
  } catch {
    return null;
  }
});

export async function generateMetadata() {
  const homepage = await getHomepage();
  const title =
    homepage && typeof homepage.hero_title === "string" && homepage.hero_title
      ? homepage.hero_title
      : "Home";
  return {
    title,
    description:
      homepage && typeof homepage.hero_subtitle === "string"
        ? homepage.hero_subtitle
        : undefined,
  };
}

function isExternalHref(href) {
  return /^https?:\/\//i.test(href);
}

function CtaButton({ href, children }) {
  if (!href || !children) return null;
  const className =
    "inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-base font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900";

  if (isExternalHref(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default async function Home() {
  const homepage = await getHomepage();

  const title =
    homepage && typeof homepage.hero_title === "string" ? homepage.hero_title : "Welcome";
  const subtitle =
    homepage && typeof homepage.hero_subtitle === "string" ? homepage.hero_subtitle : "";
  const bgUrl = homepage ? getHeroImageUrl(homepage.hero_image) : null;
  const ctaText = homepage && typeof homepage.cta_text === "string" ? homepage.cta_text : "";
  const ctaLink = homepage && typeof homepage.cta_link === "string" ? homepage.cta_link : "";

  return (
    <main className="min-h-screen w-full font-sans">
      <section className="relative flex min-h-[85vh] w-full flex-col items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 bg-zinc-900">
          {bgUrl ? (
            <Image
              src={contentstackImageSrc(bgUrl)}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-950" />
          )}
          <div className="absolute inset-0 bg-black/55" aria-hidden />
        </div>

        {/* Overlay content */}
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="max-w-2xl text-lg leading-relaxed text-zinc-100 drop-shadow-sm sm:text-xl">
              {subtitle}
            </p>
          ) : null}
          {ctaText && ctaLink ? (
            <div className="mt-2">
              <CtaButton href={ctaLink}>{ctaText}</CtaButton>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
