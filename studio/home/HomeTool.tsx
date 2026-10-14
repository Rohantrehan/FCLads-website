import { Badge, Box, Card, Container, Flex, Grid, Heading, Spinner, Stack, Text } from "@sanity/ui";
import { BookIcon } from "@sanity/icons/Book";
import { CommentIcon } from "@sanity/icons/Comment";
import { HomeIcon } from "@sanity/icons/Home";
import { PlayIcon } from "@sanity/icons/Play";
import { TrendUpwardIcon } from "@sanity/icons/TrendUpward";
import { useEffect, useState, type ComponentType } from "react";
import { useClient, useCurrentUser, type Tool } from "sanity";
import { IntentLink } from "sanity/router";

// The Studio's first screen: big "new post" buttons, the person's recent work and how posting works.

const POST_TYPES: { type: string; title: string; text: string; icon: ComponentType }[] = [
  { type: "tradingPost", title: "Trading post", text: "A market call with an optional screenshot.", icon: TrendUpwardIcon },
  { type: "feedPost", title: "Feed post", text: "A clip, tip, poll, update or trading targets.", icon: CommentIcon },
  { type: "guide", title: "Guide", text: "A members-only article or video guide.", icon: BookIcon },
  { type: "collection", title: "Video collection", text: "A series of videos, watched in order.", icon: PlayIcon },
];

const TYPE_NAMES: Record<string, string> = Object.fromEntries(POST_TYPES.map((post) => [post.type, post.title]));

interface Recent {
  _id: string;
  _type: string;
  _updatedAt: string;
  title?: string;
}

const RECENT_QUERY = /* groq */ `*[_type in $types] | order(_updatedAt desc)[0...30] {
  _id, _type, _updatedAt, "title": coalesce(title, question, text)
}`;

const timeAgo = (iso: string) => {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
};

/** Latest edited posts, one row per document (a draft and its published copy count once). */
function useRecent() {
  const client = useClient({ apiVersion: "2025-02-19" });
  const [items, setItems] = useState<(Recent & { draft: boolean })[] | undefined>();

  useEffect(() => {
    let active = true;
    client
      .fetch<Recent[]>(RECENT_QUERY, { types: POST_TYPES.map((post) => post.type) }, { perspective: "raw" })
      .then((rows) => {
        if (!active) return;
        const seen = new Set<string>();
        const list: (Recent & { draft: boolean })[] = [];
        for (const row of rows) {
          const id = row._id.replace(/^drafts\./, "");
          if (seen.has(id)) continue;
          seen.add(id);
          list.push({ ...row, _id: id, draft: row._id.startsWith("drafts.") });
        }
        setItems(list.slice(0, 8));
      })
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, [client]);

  return items;
}

function NewPostCard({ type, title, text, icon: Icon }: (typeof POST_TYPES)[number]) {
  return (
    <Card
      as={IntentLink}
      intent="create"
      params={{ type }}
      padding={4}
      radius={3}
      shadow={1}
      tone="default"
      style={{ textDecoration: "none", border: "1px solid rgba(43, 217, 139, 0.25)" }}
    >
      <Flex gap={3} align="flex-start">
        <Box style={{ fontSize: 28, color: "#2bd98b", lineHeight: 0 }}>
          <Icon />
        </Box>
        <Stack gap={3}>
          <Text size={2} weight="bold">
            + {title}
          </Text>
          <Text size={1} muted>
            {text}
          </Text>
        </Stack>
      </Flex>
    </Card>
  );
}

function HomeScreen() {
  const user = useCurrentUser();
  const recent = useRecent();
  const firstName = user?.name?.split(" ")[0];

  return (
    <Box padding={[4, 5, 6]} style={{ overflowY: "auto", height: "100%" }}>
      <Container width={2}>
        <Stack gap={6}>
          <Stack gap={4}>
            <Heading size={4} as="h1">
              {firstName ? `Hi ${firstName}, what are you posting today?` : "What are you posting today?"}
            </Heading>
            <Text muted>Pick one to start. You can save it as a draft and finish it later.</Text>
          </Stack>

          <Grid gridTemplateColumns={[1, 1, 2]} gap={3}>
            {POST_TYPES.map((post) => (
              <NewPostCard key={post.type} {...post} />
            ))}
          </Grid>

          <Stack gap={3}>
            <Heading size={1} as="h2">
              Recently edited
            </Heading>
            <Card radius={3} border>
              {recent === undefined ? (
                <Flex padding={4} justify="center">
                  <Spinner muted />
                </Flex>
              ) : recent.length === 0 ? (
                <Box padding={4}>
                  <Text muted size={1}>
                    Nothing yet. Your posts will show up here.
                  </Text>
                </Box>
              ) : (
                <Stack>
                  {recent.map((item, index) => (
                    <Card
                      key={item._id}
                      as={IntentLink}
                      intent="edit"
                      params={{ id: item._id, type: item._type }}
                      padding={3}
                      borderTop={index > 0}
                      style={{ textDecoration: "none" }}
                    >
                      <Flex align="center" gap={3}>
                        <Box flex={1} style={{ minWidth: 0 }}>
                          <Text size={1} weight="semibold" textOverflow="ellipsis">
                            {item.title || "Untitled"}
                          </Text>
                        </Box>
                        <Text size={0} muted>
                          {TYPE_NAMES[item._type]}
                        </Text>
                        <Badge tone={item.draft ? "caution" : "positive"}>{item.draft ? "Draft" : "Live"}</Badge>
                        <Text size={0} muted>
                          {timeAgo(item._updatedAt)}
                        </Text>
                      </Flex>
                    </Card>
                  ))}
                </Stack>
              )}
            </Card>
          </Stack>

          <Card padding={4} radius={3} tone="primary" border>
            <Stack gap={4}>
              <Heading size={1} as="h2">
                How posting works
              </Heading>
              <Stack gap={3}>
                <Text size={1}>1. Fill in the form. Fields marked with a red message are needed before you can publish.</Text>
                <Text size={1}>
                  2. Choose who can see it: <strong>Free</strong> (everyone) or <strong>FC Lads+</strong> (members only).
                  Members-only text never reaches people who haven&apos;t paid.
                </Text>
                <Text size={1}>
                  3. Press <strong>Publish</strong> (bottom right). It&apos;s on the site within a few minutes. Not ready?
                  Just close it: it stays as a draft.
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

export const homeTool: Tool = {
  name: "home",
  title: "Home",
  icon: HomeIcon,
  component: HomeScreen,
};
