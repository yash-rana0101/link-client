"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/common/State";
import { useAuth } from "@/features/auth/useAuth";
import { type FeedSignal, PostCard } from "@/features/feed/PostCard";
import { PostComposer } from "@/features/feed/PostComposer";
import { useFeed } from "@/features/feed/useFeed";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

type FeedFilter = "all" | FeedSignal;

const feedFilters: Array<{ key: FeedFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "wins", label: "Wins" },
  { key: "proof", label: "Proof" },
  { key: "insights", label: "Insights" },
  { key: "jobs", label: "Jobs" },
];

const sidebarItems = [
  { href: "/feed", label: "Feed", icon: "F" },
  { href: "/profile", label: "Profile", icon: "P" },
  { href: "/connections", label: "Connections", icon: "C" },
  { href: "/verification", label: "Verification", icon: "V" },
  { href: "/jobs", label: "Jobs", icon: "J" },
  { href: "/messaging", label: "Messaging", icon: "M" },
];

const signalRegex: Record<FeedSignal, RegExp> = {
  wins: /\b(win|wins|shipped|launch|milestone|improved|delivered|achievement)\b/,
  proof: /\b(proof|artifact|audit|benchmark|verification|validated|evidence|latency)\b/,
  insights: /\b(insight|analysis|learning|trend|design|strategy|roadmap)\b/,
  jobs: /\b(job|jobs|hiring|position|opening|candidate|apply|interview)\b/,
};

const getSignal = (content: string): FeedSignal => {
  const normalized = content.toLowerCase();

  if (signalRegex.jobs.test(normalized)) {
    return "jobs";
  }

  if (signalRegex.proof.test(normalized)) {
    return "proof";
  }

  if (signalRegex.wins.test(normalized)) {
    return "wins";
  }

  return "insights";
};

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ZT";

const clampScore = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const FeedLoadingSkeleton = () => (
  <section className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
    <aside className="hidden lg:block space-y-4">
      <div className="h-48 animate-pulse rounded-2xl border border-surface-300 bg-surface-100" />
      <div className="h-52 animate-pulse rounded-2xl border border-surface-300 bg-surface-100" />
    </aside>

    <div className="space-y-4">
      <div className="h-36 animate-pulse rounded-2xl border border-surface-300 bg-surface-100" />
      <div className="h-10 animate-pulse rounded-2xl border border-surface-300 bg-surface-100" />
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-56 animate-pulse rounded-2xl border border-surface-300 bg-surface-100"
        />
      ))}
    </div>

    <aside className="hidden xl:block space-y-4">
      <div className="h-60 animate-pulse rounded-2xl border border-surface-300 bg-surface-100" />
      <div className="h-56 animate-pulse rounded-2xl border border-surface-300 bg-surface-100" />
    </aside>
  </section>
);

const LeftSidebar = ({
  name,
  role,
  trustScore,
  profileViews,
  postImpressions,
  profileHref,
  closeOnNavigate,
}: {
  name: string;
  role: string;
  trustScore: number;
  profileViews: number;
  postImpressions: number;
  profileHref: string;
  closeOnNavigate?: () => void;
}) => (
  <div className="space-y-4">
    <article className="rounded-2xl border border-surface-300 bg-surface-100 p-4">
      <div className="flex items-center gap-3">
        <Link
          href={profileHref}
          onClick={closeOnNavigate}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-trust-200 bg-trust-100 text-sm font-semibold text-trust-700 transition-transform duration-200 hover:scale-[1.04]"
        >
          {getInitials(name)}
        </Link>
        <div className="min-w-0">
          <Link
            href={profileHref}
            onClick={closeOnNavigate}
            className="truncate font-semibold text-surface-900 transition-colors duration-200 hover:text-trust-700"
          >
            {name}
          </Link>
          <p className="truncate text-xs text-surface-600">{role}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-trust-200 bg-trust-100/70 p-3">
        <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-trust-700">
          <span>Trust Score</span>
          <span>{trustScore} / 100</span>
        </div>
        <div className="h-2 rounded-full bg-white/70">
          <div
            className="h-2 rounded-full bg-trust-500"
            style={{ width: `${clampScore(trustScore)}%` }}
          />
        </div>
      </div>
    </article>

    <article className="rounded-2xl border border-surface-300 bg-surface-100 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-500">
        Quick Stats
      </p>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-surface-600">Profile views</span>
          <span className="font-semibold text-trust-700">{profileViews}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-surface-600">Post impressions</span>
          <span className="font-semibold text-trust-700">{postImpressions}</span>
        </div>
      </div>
    </article>

    <nav className="rounded-2xl border border-surface-300 bg-surface-100 p-2">
      {sidebarItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={closeOnNavigate}
          className={[
            "mb-1 flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors duration-200",
            item.href === "/feed"
              ? "bg-trust-100 text-trust-700"
              : "text-surface-600 hover:bg-white hover:text-surface-900",
          ].join(" ")}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-surface-300 bg-white text-[11px] font-semibold text-surface-600">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  </div>
);

const RightRail = ({
  insightItems,
  suggestions,
}: {
  insightItems: string[];
  suggestions: Array<{
    id: string;
    name: string;
    trustScore: number;
    profileImageUrl: string | null;
    publicProfileUrl: string | null;
  }>;
}) => (
  <div className="space-y-4">
    <article className="rounded-2xl border border-surface-300 bg-surface-100 p-4">
      <h3 className="text-lg font-semibold text-surface-900">Network Insights</h3>
      <ul className="mt-3 space-y-2 text-sm text-surface-700">
        {insightItems.map((item) => (
          <li key={item} className="rounded-lg bg-white px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </article>

    <article className="rounded-2xl border border-surface-300 bg-surface-100 p-4">
      <h3 className="text-lg font-semibold text-surface-900">Suggested Connections</h3>
      <div className="mt-3 space-y-3">
        {suggestions.length ? (
          suggestions.map((item) => (
            <div key={item.id} className="rounded-xl bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {item.publicProfileUrl ? (
                    <Link
                      href={`/in/${item.publicProfileUrl}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-xs font-semibold text-surface-700"
                    >
                      {item.profileImageUrl ? (
                        <img
                          src={item.profileImageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(item.name)
                      )}
                    </Link>
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-xs font-semibold text-surface-700">
                      {item.profileImageUrl ? (
                        <img
                          src={item.profileImageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(item.name)
                      )}
                    </div>
                  )}

                  <div className="min-w-0">
                    {item.publicProfileUrl ? (
                      <Link
                        href={`/in/${item.publicProfileUrl}`}
                        className="truncate text-sm font-semibold text-surface-900 transition-colors duration-200 hover:text-trust-700"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <p className="truncate text-sm font-semibold text-surface-900">{item.name}</p>
                    )}
                    <p className="text-xs text-surface-500">Trust {item.trustScore}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-surface-300 px-3 py-1 text-xs font-semibold text-surface-700 transition-colors duration-200 hover:border-trust-300 hover:bg-trust-100 hover:text-trust-700"
                >
                  Connect
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-xl bg-white px-3 py-2 text-sm text-surface-600">
            Suggestions appear as your network grows.
          </p>
        )}
      </div>
    </article>

    <article className="rounded-2xl border border-surface-300 bg-surface-100 p-4">
      <h3 className="text-lg font-semibold text-surface-900">Hiring Pulse</h3>
      <p className="mt-2 text-sm text-surface-600">
        Verified hiring activity is trending up this week. Keep your updates clear,
        proof-backed, and trust-first.
      </p>
    </article>
  </div>
);

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("all");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { feedQuery, posts, createPostMutation, likeMutation, commentMutation } =
    useFeed();

  const canLoadMore = Boolean(feedQuery.hasNextPage && !feedQuery.isFetchingNextPage);

  const signalByPostId = useMemo(() => {
    const map = new Map<string, FeedSignal>();

    for (const post of posts) {
      map.set(post.id, getSignal(post.content));
    }

    return map;
  }, [posts]);

  const filterCounts = useMemo(
    () =>
      posts.reduce(
        (accumulator, post) => {
          const signal = signalByPostId.get(post.id) ?? "insights";
          accumulator[signal] += 1;
          return accumulator;
        },
        {
          wins: 0,
          proof: 0,
          insights: 0,
          jobs: 0,
        },
      ),
    [posts, signalByPostId],
  );

  const filteredPosts = useMemo(() => {
    if (activeFilter === "all") {
      return posts;
    }

    return posts.filter((post) => (signalByPostId.get(post.id) ?? "insights") === activeFilter);
  }, [activeFilter, posts, signalByPostId]);

  const profileViews = Math.max(120, posts.length * 24 + 80);

  const postImpressions = useMemo(
    () =>
      posts.reduce(
        (sum, post) => sum + post.likeCount * 12 + post.commentCount * 18 + 40,
        0,
      ),
    [posts],
  );

  const insightItems = useMemo(() => {
    return [
      `${filterCounts.wins} verified wins shared today`,
      `${filterCounts.proof} proof-driven updates in your network`,
      `${filterCounts.jobs} hiring signals from trusted professionals`,
      `${Math.max(1, posts.length)} curated updates in this feed window`,
    ];
  }, [filterCounts.jobs, filterCounts.proof, filterCounts.wins, posts.length]);

  const suggestions = useMemo(() => {
    const seen = new Set<string>();

    return posts
      .map((post) => ({
        id: post.user.id,
        name: post.user.name ?? post.user.email,
        trustScore: post.user.trustScore,
        profileImageUrl: post.user.profileImageUrl,
        publicProfileUrl: post.user.publicProfileUrl,
      }))
      .filter((item) => {
        if (item.id === user?.id || seen.has(item.id)) {
          return false;
        }

        seen.add(item.id);
        return true;
      })
      .sort((left, right) => right.trustScore - left.trustScore)
      .slice(0, 4);
  }, [posts, user?.id]);

  const mutationError = useMemo(() => {
    const error =
      createPostMutation.error ?? likeMutation.error ?? commentMutation.error ?? null;

    if (!error) {
      return null;
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "Action failed. Please retry.";
  }, [commentMutation.error, createPostMutation.error, likeMutation.error]);

  const loadMoreRef = useInfiniteScroll(
    () => {
      if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
        feedQuery.fetchNextPage();
      }
    },
    canLoadMore,
  );

  const likePendingPostId = useMemo(
    () => (typeof likeMutation.variables === "string" ? likeMutation.variables : null),
    [likeMutation.variables],
  );

  const commentPendingPostId = useMemo(
    () => commentMutation.variables?.postId ?? null,
    [commentMutation.variables],
  );

  if (feedQuery.isLoading) {
    return <FeedLoadingSkeleton />;
  }

  if (feedQuery.isError) {
    return (
      <ErrorState
        title="Feed unavailable"
        description="We could not load the current feed."
        action={<Button onClick={() => feedQuery.refetch()}>Retry</Button>}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="rounded-full border border-surface-300 bg-surface-100 px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors duration-200 hover:bg-white"
        >
          Open sidebar
        </button>
        <p className="text-xs font-semibold uppercase tracking-wide text-surface-500">
          {filteredPosts.length} updates
        </p>
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-surface-900/25"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[80vw] overflow-y-auto border-r border-surface-300 bg-[#f3f6f1] p-4">
            <LeftSidebar
              name={user?.name ?? user?.email ?? "Yash Rana"}
              role={user?.currentRole ?? user?.headline ?? "Backend Engineer"}
              trustScore={clampScore(user?.trustScore ?? 82)}
              profileViews={profileViews}
              postImpressions={postImpressions}
              profileHref={user?.publicProfileUrl ? `/in/${user.publicProfileUrl}` : "/profile"}
              closeOnNavigate={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="hidden lg:block">
          <LeftSidebar
            name={user?.name ?? user?.email ?? "Yash Rana"}
            role={user?.currentRole ?? user?.headline ?? "Backend Engineer"}
            trustScore={clampScore(user?.trustScore ?? 82)}
            profileViews={profileViews}
            postImpressions={postImpressions}
            profileHref={user?.publicProfileUrl ? `/in/${user.publicProfileUrl}` : "/profile"}
          />
        </aside>

        <div className="space-y-4">
          <PostComposer
            onCreatePost={({ content, imageUrl }) =>
              createPostMutation.mutateAsync({ content, imageUrl })
            }
            isSubmitting={createPostMutation.isPending}
            authorName={user?.name ?? user?.email ?? "Yash Rana"}
            authorImageUrl={user?.profileImageUrl ?? null}
            authorProfileHref={
              user?.publicProfileUrl ? `/in/${user.publicProfileUrl}` : "/profile"
            }
          />

          <div className="overflow-x-auto">
            <div className="inline-flex gap-2 rounded-full border border-surface-300 bg-surface-100 p-1">
              {feedFilters.map((filter) => {
                const count =
                  filter.key === "all" ? posts.length : filterCounts[filter.key];
                const active = activeFilter === filter.key;

                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className={[
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                      active
                        ? "bg-trust-500 text-white"
                        : "text-surface-600 hover:bg-white hover:text-surface-900",
                    ].join(" ")}
                  >
                    {filter.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {mutationError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {mutationError}
            </div>
          ) : null}

          {filteredPosts.length ? (
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  signal={signalByPostId.get(post.id) ?? "insights"}
                  onLike={(postId) => likeMutation.mutateAsync(postId)}
                  onComment={(postId, content) =>
                    commentMutation.mutateAsync({ postId, content })
                  }
                  isLikePending={likeMutation.isPending && likePendingPostId === post.id}
                  isCommentPending={
                    commentMutation.isPending && commentPendingPostId === post.id
                  }
                />
              ))}
            </div>
          ) : posts.length ? (
            <EmptyState
              title="No updates in this filter"
              description="Try a different feed filter to discover more trusted updates."
              action={
                <Button variant="secondary" onClick={() => setActiveFilter("all")}>
                  Show all
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="Feed is quiet"
              description="Start by sharing your first trusted update."
            />
          )}

          <div ref={loadMoreRef} className="flex h-10 items-center justify-center">
            {feedQuery.hasNextPage ? (
              <Button
                variant="secondary"
                onClick={() => feedQuery.fetchNextPage()}
                disabled={feedQuery.isFetchingNextPage}
              >
                {feedQuery.isFetchingNextPage ? "Loading..." : "Load more"}
              </Button>
            ) : null}
          </div>
        </div>

        <aside className="hidden xl:block">
          <RightRail insightItems={insightItems} suggestions={suggestions} />
        </aside>
      </div>

      <div className="xl:hidden">
        <RightRail insightItems={insightItems} suggestions={suggestions} />
      </div>
    </section>
  );
}
