import type { Metadata } from "next";
import { Hash, MessagesSquare, Pin, ScrollText, Users } from "lucide-react";
import { DiscordConnect, DiscordNote } from "@/components/account/DiscordLink";
import { DashboardHeading, DashPanel, MembersOnly } from "@/components/dashboard/DashboardBits";
import { Avatar } from "@/components/ui/DataBits";
import { getContent } from "@/lib/content";
import { discordServerUrl, getDiscordLink, isDiscordConfigured } from "@/lib/discord";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Discord" };

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export default async function DashboardDiscordPage({ searchParams }: PageProps<"/dashboard/discord">) {
  const viewer = await getViewer();
  if (!viewer.isMember) return <MembersOnly />;
  const [{ creators, settings }, link, { discord: result }] = await Promise.all([getContent(), getDiscordLink(viewer.id), searchParams]);
  // Channels, rules and the invite link are edited on the posting board (Site settings).
  const invite = settings.socials.discord;
  const { channels, rules } = settings.discord;

  return (
    <div className="page-container flex flex-col gap-8 pt-10 pb-20">
      <DashboardHeading
        eyebrow="Discord"
        title="The private Discord"
        description="Members-only channels with the Lads: tactics help, squad feedback, trading alerts and a direct line to the creators."
      />
      <DiscordNote result={result} />

      <section
        aria-labelledby="discord-connect-heading"
        className="grid grid-cols-1 gap-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-pitch-green/60 to-[#0f141b] p-5 md:p-8 lg:grid-cols-12 lg:items-center"
      >
        <div className="flex flex-col gap-3 lg:col-span-8">
          <span className="flex size-12 items-center justify-center rounded-xl bg-[#5865F2]/20 text-[#a5adff]">
            <MessagesSquare aria-hidden className="size-6" />
          </span>
          <h2 id="discord-connect-heading" className="font-display text-2xl font-extrabold uppercase md:text-3xl">
            FC Lads+ members&apos; server
          </h2>
          <p className="max-w-xl text-muted">
            Patch news as it happens, tactics workshops, and channels where the Lads answer your questions every day.
          </p>
        </div>
        <div className="lg:col-span-4">
          <DiscordConnect link={link} configured={isDiscordConfigured} invite={invite} serverUrl={discordServerUrl ?? invite} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {channels.length > 0 && (
        <section aria-labelledby="channels-heading" className="flex flex-col gap-4 lg:col-span-8">
          <h2 id="channels-heading" className="flex items-center gap-2 font-display text-lg font-extrabold uppercase">
            <Hash aria-hidden className="size-5 text-primary" />
            Main channels
          </h2>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {channels.map((channel) => (
              <li
                key={channel.name}
                className="group relative flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#0f141b] p-5 transition-colors hover:border-primary/40"
              >
                <p className="flex items-center justify-between gap-2">
                  {invite ? (
                    <a
                      href={invite}
                      {...external}
                      className="font-display text-lg font-extrabold after:absolute after:inset-0 group-hover:text-primary"
                    >
                      <span className="text-muted">#</span>
                      {channel.name}
                    </a>
                  ) : (
                    <span className="font-display text-lg font-extrabold">
                      <span className="text-muted">#</span>
                      {channel.name}
                    </span>
                  )}
                  <span className="tabular rounded bg-white/5 px-2 py-0.5 text-[10px] text-muted uppercase">
                    {channel.label}
                  </span>
                </p>
                <p className="text-sm text-muted">{channel.description}</p>
                {channel.pinned && (
                  <p className="mt-auto flex items-start gap-2 rounded-lg bg-surface p-3 text-xs">
                    <Pin aria-hidden className="mt-0.5 size-3.5 shrink-0 text-gold" />
                    <span>
                      <span className="text-muted">Pinned: </span>
                      {channel.pinned}
                    </span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
        )}

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <DashPanel
            id="lads-heading"
            title="The Lads in the server"
            icon={<Users aria-hidden className="size-5 text-primary" />}
          >
            <ul className="flex flex-col gap-3">
              {creators.map((creator) => (
                <li key={creator.slug} className="flex items-center gap-3">
                  <Avatar initials={creator.initials} tone="mint" />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-bold">{creator.name}</span>
                    <span className="truncate text-xs text-muted">{creator.role}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted">Tag them in #ask-the-lads. They reply every day.</p>
          </DashPanel>

          {rules.length > 0 && (
          <DashPanel
            id="rules-heading"
            title="Server rules"
            icon={<ScrollText aria-hidden className="size-5 text-primary" />}
          >
            <ol className="flex flex-col gap-2 text-sm">
              {rules.map((rule, index) => (
                <li key={rule} className="flex gap-3">
                  <span className="tabular text-xs font-bold text-primary">{index + 1}</span>
                  {rule}
                </li>
              ))}
            </ol>
          </DashPanel>
          )}
        </aside>
      </div>
    </div>
  );
}
