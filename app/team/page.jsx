import Image from "next/image";
import { contentstackImageSrc } from "@/lib/contentstack-image";
import { getEntries } from "@/lib/contentstack";

const TEAM_MEMBER_UID = "team_member";

function getPhotoUrl(photo) {
  if (!photo || typeof photo !== "object") return null;
  if (typeof photo.url === "string") return photo.url;
  return null;
}

async function getTeamMembers() {
  try {
    return await getEntries(TEAM_MEMBER_UID);
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Team",
  description: "Meet the team",
};

export default async function TeamPage() {
  const members = await getTeamMembers();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 font-sans text-zinc-900 dark:text-zinc-100">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Team</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">People behind the work.</p>
      </header>

      {members.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">No team members yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => {
            const name = typeof member.name === "string" ? member.name : "Team member";
            const role = typeof member.role === "string" ? member.role : "";
            const bio = typeof member.bio === "string" ? member.bio : "";
            const linkedinUrl =
              typeof member.linkedin_url === "string" ? member.linkedin_url.trim() : "";
            const photoUrl = getPhotoUrl(member.photo);

            return (
              <li key={member.uid ?? name}>
                <article className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    {photoUrl ? (
                      <Image
                        src={contentstackImageSrc(photoUrl, 800)}
                        alt=""
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{name}</h2>
                    {role ? (
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{role}</p>
                    ) : null}
                    {bio ? (
                      <p className="mt-1 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {bio}
                      </p>
                    ) : null}
                    {linkedinUrl ? (
                      <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex text-sm font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
                      >
                        LinkedIn
                      </a>
                    ) : null}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
