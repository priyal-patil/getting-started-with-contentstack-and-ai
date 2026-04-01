import Link from "next/link";
import { getNavigationItems } from "@/lib/contentstack";

function isExternalHref(href) {
  return /^https?:\/\//i.test(href);
}

function NavLink({ href, children }) {
  if (!href) return null;
  const className =
    "rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50";

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

export async function NavigationBar() {
  const items = await getNavigationItems();

  const links = items
    .map((item) => ({
      label: typeof item.label === "string" ? item.label.trim() : "",
      link: typeof item.link === "string" ? item.link.trim() : "",
      order: typeof item.order === "number" ? item.order : 0,
      uid: item.uid,
    }))
    .filter((item) => item.label && item.link)
    .sort((a, b) => a.order - b.order);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <nav
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-3 sm:gap-2"
        aria-label="Main navigation"
      >
        {links.map((item) => (
          <NavLink key={item.uid ?? `${item.label}-${item.link}`} href={item.link}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
