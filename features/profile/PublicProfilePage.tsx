"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/common/State";
import { Spinner } from "@/components/ui/Spinner";
import { CONNECTIONS_PENDING_QUERY_KEY, CONNECTIONS_QUERY_KEY } from "@/features/connections/useConnections";
import { FEED_QUERY_KEY } from "@/features/feed/useFeed";
import { ExperienceCard } from "@/features/profile/ExperienceCard";
import { ProfilePostSections } from "@/features/profile/ProfilePostSections";
import { PUBLIC_PROFILE_QUERY_KEY, usePublicProfile } from "@/features/profile/useProfile";
import { useGlobalSearch } from "@/features/search/useSearch";
import { formatDateTime } from "@/lib/date";
import { connectionService } from "@/services/connection.service";
import { followService } from "@/services/follow.service";
import { reportService } from "@/services/report.service";
import { useAppSelector } from "@/store/hooks";
import type { GlobalSearchUserResult } from "@/types/search";
import type { ProfileReportReason } from "@/types/report";

interface PublicProfilePageProps {
  publicProfileUrl: string;
}

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ZT";

const toConnectionsLabel = (count: number) => {
  if (count >= 500) {
    return "500+ connections";
  }

  if (count === 1) {
    return "1 connection";
  }

  return `${count} connections`;
};

const toSearchHref = (query: string) => {
  const normalized = query.trim();

  if (!normalized) {
    return "/search";
  }

  return `/search?q=${encodeURIComponent(normalized)}`;
};

const getClientErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return "Request failed.";
};

const parseProfileReportReason = (value: string): ProfileReportReason | null => {
  const normalized = value.trim().toUpperCase();

  if (!normalized) {
    return null;
  }

  const aliasMap: Record<string, ProfileReportReason> = {
    SPAM: "SPAM",
    IMPERSONATION: "IMPERSONATION",
    HARASSMENT: "HARASSMENT",
    MISINFORMATION: "MISINFORMATION",
    INAPPROPRIATE: "INAPPROPRIATE",
    OTHER: "OTHER",
    ABUSE: "HARASSMENT",
    FAKE: "IMPERSONATION",
  };

  return aliasMap[normalized] ?? null;
};

const SuggestedAccountRow = ({
  account,
  ctaLabel,
}: {
  account: GlobalSearchUserResult;
  ctaLabel: string;
}) => {
  const displayName = account.name ?? "Anonymous professional";
  const subtitle = [account.currentRole, account.location].filter(Boolean).join(" · ");
  const href = account.publicProfileUrl
    ? `/in/${account.publicProfileUrl}`
    : toSearchHref(displayName);

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href={href}
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-xs font-semibold text-surface-700"
        >
          {account.profileImageUrl ? (
            <img
              src={account.profileImageUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(displayName)
          )}
        </Link>

        <div className="min-w-0">
          <Link
            href={href}
            className="truncate text-sm font-semibold text-surface-900 transition-colors duration-200 hover:text-trust-700"
          >
            {displayName}
          </Link>
          <p className="truncate text-xs text-surface-600">
            {subtitle || "Trusted network member"}
          </p>
        </div>
      </div>

      <Link
        href={href}
        className="inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-surface-300 px-3 text-xs font-semibold text-surface-700 transition-colors duration-200 hover:bg-surface-100"
      >
        {ctaLabel}
      </Link>
    </div>
  );
};

export const PublicProfilePage = ({ publicProfileUrl }: PublicProfilePageProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const profileQuery = usePublicProfile(publicProfileUrl);
  const normalizedPublicProfileUrl = publicProfileUrl.trim();
  const targetProfileId = profileQuery.data?.profile.id ?? "";
  const isOwner = Boolean(user?.id && targetProfileId && user.id === targetProfileId);

  const followStatusQuery = useQuery({
    queryKey: ["follow", "status", targetProfileId],
    queryFn: () => followService.getFollowStatus(targetProfileId),
    enabled: Boolean(user?.id && targetProfileId && !isOwner),
    staleTime: 15_000,
    retry: 1,
  });

  const connectionStatusQuery = useQuery({
    queryKey: ["connections", "status", targetProfileId],
    queryFn: () => connectionService.getConnectionStatus(targetProfileId),
    enabled: Boolean(user?.id && targetProfileId && !isOwner),
    staleTime: 15_000,
    retry: 1,
  });

  const followMutation = useMutation({
    mutationFn: async ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) => {
      if (isFollowing) {
        await followService.unfollowUser(userId);
        return;
      }

      await followService.followUser(userId);
    },
    onSuccess: async () => {
      setReportError(null);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["follow", "status", targetProfileId] }),
        queryClient.invalidateQueries({ queryKey: [PUBLIC_PROFILE_QUERY_KEY, normalizedPublicProfileUrl] }),
        queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY }),
      ]);
    },
    onError: (error) => {
      setReportError(getClientErrorMessage(error));
      setActionNotice(null);
    },
  });

  const connectMutation = useMutation({
    mutationFn: (receiverId: string) => connectionService.requestConnection({
      receiverId,
      relationship: "COLD_OUTREACH",
    }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["connections", "status", targetProfileId] }),
        queryClient.invalidateQueries({ queryKey: CONNECTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: CONNECTIONS_PENDING_QUERY_KEY }),
      ]);
    },
  });

  const reportMutation = useMutation({
    mutationFn: reportService.createProfileReport,
    onSuccess: () => {
      setReportError(null);
      setActionNotice("Profile reported. Our team will review it.");
      setIsActionMenuOpen(false);
    },
    onError: (error) => {
      setReportError(getClientErrorMessage(error));
      setActionNotice(null);
    },
  });

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!actionMenuRef.current) {
        return;
      }

      if (actionMenuRef.current.contains(event.target as Node)) {
        return;
      }

      setIsActionMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const suggestionSeed =
    profileQuery.data?.profile.location?.trim()
    || profileQuery.data?.profile.currentRole?.trim()
    || profileQuery.data?.profile.headline?.trim()
    || profileQuery.data?.profile.name?.trim()
    || "";

  const interestSeed =
    profileQuery.data?.profile.skills[0]?.name?.trim()
    || profileQuery.data?.experiences[0]?.companyName?.trim()
    || profileQuery.data?.experiences[0]?.role?.trim()
    || "";

  const suggestedAccountsQuery = useGlobalSearch(suggestionSeed, 8, Boolean(suggestionSeed));
  const interestedProfilesQuery = useGlobalSearch(interestSeed, 8, Boolean(interestSeed));

  const handleToggleFollow = () => {
    if (!targetProfileId) {
      return;
    }

    if (!user?.id) {
      router.push("/login");
      return;
    }

    followMutation.mutate({
      userId: targetProfileId,
      isFollowing: followStatusQuery.data?.isFollowing ?? false,
    });

    setReportError(null);
  };

  const handleConnect = () => {
    if (!targetProfileId) {
      return;
    }

    if (!user?.id) {
      router.push("/login");
      return;
    }

    const connectionStatus = connectionStatusQuery.data;

    if (connectionStatus?.hasPendingRequestToCurrentUser) {
      router.push("/connections");
      setIsActionMenuOpen(false);
      return;
    }

    if (connectionStatus?.isConnected || connectionStatus?.hasPendingRequestFromCurrentUser) {
      setIsActionMenuOpen(false);
      return;
    }

    connectMutation.mutate(targetProfileId);
    setIsActionMenuOpen(false);
    setReportError(null);
  };

  const handleShareProfile = async () => {
    if (typeof window === "undefined") {
      return;
    }

    const pathname = normalizedPublicProfileUrl ? `/in/${normalizedPublicProfileUrl}` : window.location.pathname;
    const shareUrl = `${window.location.origin}${pathname}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setActionNotice("Profile link copied.");
      setReportError(null);
      setIsActionMenuOpen(false);
    } catch {
      setActionNotice("Unable to copy profile link.");
      setIsActionMenuOpen(false);
    }
  };

  const handleReportProfile = async () => {
    if (!targetProfileId) {
      return;
    }

    if (!user?.id) {
      router.push("/login");
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const reasonInput = window.prompt(
      "Report reason (SPAM, IMPERSONATION, HARASSMENT, MISINFORMATION, INAPPROPRIATE, OTHER)",
      "OTHER",
    );

    if (reasonInput === null) {
      return;
    }

    const reason = parseProfileReportReason(reasonInput);

    if (!reason) {
      setReportError("Invalid report reason.");
      setActionNotice(null);
      return;
    }

    const detailsInput = window.prompt("Optional details for report", "");

    reportMutation.mutate({
      reportedUserId: targetProfileId,
      reason,
      details: detailsInput?.trim() ? detailsInput.trim() : undefined,
    });
  };

  if (profileQuery.isLoading) {
    return (
      <div className="flex h-56 items-center justify-center">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorState
          title="Public profile not available"
          description="This profile URL does not exist or is unavailable right now."
          action={(
            <Button variant="secondary" onClick={() => profileQuery.refetch()}>
              Retry
            </Button>
          )}
        />
      </div>
    );
  }

  const {
    profile,
    stats,
    experiences,
    certificates,
    education,
    projects,
    posts,
    featuredPost,
    analytics,
  } = profileQuery.data;

  const topExperience = experiences[0] ?? null;
  const topCertificate = certificates[0] ?? null;
  const roleLine = [profile.currentRole, profile.location].filter(Boolean).join(" · ");
  const publicProfilePath = profile.publicProfileUrl ? `/in/${profile.publicProfileUrl}` : null;

  const organizationRows = [
    topExperience
      ? {
        id: `experience-${topExperience.id}`,
        title: topExperience.companyName,
        subtitle: topExperience.role,
      }
      : null,
    topCertificate
      ? {
        id: `certificate-${topCertificate.id}`,
        title: topCertificate.companyName,
        subtitle: topCertificate.role,
      }
      : null,
  ].filter((item): item is { id: string; title: string; subtitle: string } => Boolean(item));

  const suggestedAccounts = (suggestedAccountsQuery.data?.users ?? [])
    .filter((account) => account.id !== profile.id)
    .slice(0, 4);

  const interestedProfiles = (interestedProfilesQuery.data?.users ?? [])
    .filter((account) => account.id !== profile.id)
    .slice(0, 5);

  const connectionStatus = connectionStatusQuery.data;
  const canMessage = isOwner || connectionStatus?.canMessage === true;
  const connectLabel = connectionStatus?.isConnected
    ? "Connected"
    : connectionStatus?.hasPendingRequestFromCurrentUser
      ? "Pending"
      : connectionStatus?.hasPendingRequestToCurrentUser
        ? "Review"
        : "Connect";
  const connectDisabled = (
    connectMutation.isPending
    || connectionStatusQuery.isFetching
    || connectionStatus?.isConnected
    || connectionStatus?.hasPendingRequestFromCurrentUser
  );
  const followLabel = followStatusQuery.data?.isFollowing ? "Unfollow" : "Follow";
  const activityFollowersCount = followStatusQuery.data?.followerCount ?? analytics.totalFollowers;

  return (
    <div className="w-full">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card className="overflow-hidden p-0">
            <div
              className="h-52 bg-linear-to-r from-surface-200 via-surface-100 to-trust-100 sm:h-64"
              style={
                profile.profileBannerUrl
                  ? {
                    backgroundImage: `linear-gradient(to right, rgba(23,34,27,0.14), rgba(23,34,27,0.05)), url(${profile.profileBannerUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                  : undefined
              }
            />

            <div className="px-6 pb-6">
              <div className="-mt-20 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                <div className="flex flex-col min-w-0">
                  <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-white bg-surface-100 shadow-md">
                    {profile.profileImageUrl ? (
                      <img
                        src={profile.profileImageUrl}
                        alt={profile.name ?? "Public profile"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl font-semibold text-surface-500">
                        {getInitials(profile.name ?? "ZT")}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold leading-tight text-surface-900 sm:text-3xl">
                        {profile.name ?? "Anonymous Professional"}
                      </h1>
                      <span className="rounded-full bg-surface-100 border border-surface-200 px-2 py-0.5 text-xs font-semibold text-surface-600 flex items-center gap-1">
                        <svg className="w-3 h-3 text-trust-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        3rd
                      </span>
                    </div>

                    <p className="mt-1 text-base text-surface-900">
                      {profile.headline ?? profile.currentRole ?? "Professional profile"}
                    </p>

                    <p className="mt-2 text-sm text-surface-600">
                      {roleLine || "ZeroTrust professional member"}
                      <span className="mx-1 text-surface-300">•</span>
                      <Link href="/messaging" className="font-semibold text-trust-700 hover:underline">
                        Contact info
                      </Link>
                    </p>

                    <p className="mt-2 text-sm text-surface-600">
                      <span className="font-semibold">{toConnectionsLabel(stats.totalConnections)}</span>
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {canMessage ? (
                        <Link
                          href="/messaging"
                          className="inline-flex h-9 items-center justify-center rounded-full bg-trust-600 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-trust-700 gap-1.5"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3L2 10.5l7 3.5 1.5 8L15 15l6-3V3zm-3.5 13.5l-4.5 2V14.5l-2-1-4.5-2L18 5l-4.5 11.5z" /></svg>
                          Message
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!user?.id) {
                              router.push("/login");
                              return;
                            }

                            router.push("/connections");
                          }}
                          className="inline-flex h-9 items-center justify-center rounded-full border border-surface-400 bg-white px-4 text-sm font-semibold text-surface-700 transition-colors duration-200 hover:bg-surface-50 gap-1.5"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3L2 10.5l7 3.5 1.5 8L15 15l6-3V3zm-3.5 13.5l-4.5 2V14.5l-2-1-4.5-2L18 5l-4.5 11.5z" /></svg>
                          Message
                        </button>
                      )}

                      {!isOwner ? (
                        <button
                          type="button"
                          onClick={handleToggleFollow}
                          disabled={followMutation.isPending || followStatusQuery.isFetching}
                          className={[
                            "inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors duration-200",
                            followStatusQuery.data?.isFollowing
                              ? "border-trust-500 bg-trust-50 text-trust-700 hover:bg-trust-100"
                              : "border-surface-400 bg-white text-surface-700 hover:bg-surface-50",
                            followMutation.isPending || followStatusQuery.isFetching ? "cursor-not-allowed opacity-60" : "",
                          ].join(" ")}
                        >
                          {followMutation.isPending ? "Saving..." : followLabel}
                        </button>
                      ) : null}

                      <div className="relative" ref={actionMenuRef}>
                        <button
                          type="button"
                          onClick={() => setIsActionMenuOpen((current) => !current)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-400 bg-white text-surface-700 transition-colors duration-200 hover:bg-surface-50"
                          aria-label="Open profile actions"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 12a2 2 0 110-4 2 2 0 010 4zm7 0a2 2 0 110-4 2 2 0 010 4zm7 0a2 2 0 110-4 2 2 0 010 4z" /></svg>
                        </button>

                        {isActionMenuOpen ? (
                          <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-surface-200 bg-white shadow-lg">
                            {!isOwner ? (
                              <button
                                type="button"
                                onClick={handleConnect}
                                disabled={connectDisabled}
                                className={[
                                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors",
                                  connectDisabled
                                    ? "cursor-not-allowed text-surface-400"
                                    : "text-surface-700 hover:bg-surface-100",
                                ].join(" ")}
                              >
                                <span>{connectMutation.isPending ? "Sending..." : connectLabel}</span>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => void handleShareProfile()}
                              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-surface-700 transition-colors hover:bg-surface-100"
                            >
                              <span>Share profile</span>
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 6l-4-4-4 4" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v13" /></svg>
                            </button>

                            {!isOwner ? (
                              <button
                                type="button"
                                onClick={() => void handleReportProfile()}
                                disabled={reportMutation.isPending}
                                className={[
                                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors",
                                  reportMutation.isPending
                                    ? "cursor-not-allowed text-red-300"
                                    : "text-red-600 hover:bg-red-50",
                                ].join(" ")}
                              >
                                <span>{reportMutation.isPending ? "Reporting..." : "Report profile"}</span>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v11H5l-1 1V4Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8M8 11h5" /></svg>
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {actionNotice ? (
                      <p className="mt-2 text-xs font-medium text-trust-700">{actionNotice}</p>
                    ) : null}

                    {reportError ? (
                      <p className="mt-2 text-xs font-medium text-red-600">{reportError}</p>
                    ) : null}
                  </div>
                </div>

                {organizationRows.length ? (
                  <div className="mt-4 sm:mt-24 sm:min-w-50 max-w-sm space-y-4">
                    {organizationRows.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-100 text-xs font-semibold text-surface-600 shadow-sm border border-surface-200 overflow-hidden">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=random&color=fff&size=32`} alt={item.title} className="h-full w-full object-cover" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-surface-900 transition-colors hover:text-trust-700 hover:underline cursor-pointer">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-surface-600">
                {publicProfilePath ? (
                  <span className="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-700">
                    Public URL: {publicProfilePath}
                  </span>
                ) : null}

                {topExperience ? (
                  <span className="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-700">
                    Latest role: {topExperience.role} at {topExperience.companyName}
                  </span>
                ) : null}

                <span className="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-700">
                  Trust score: {profile.trustScore}
                </span>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-2xl font-semibold text-surface-900">About</h2>
            <p className="text-sm leading-relaxed text-surface-700">
              {profile.about ?? "This professional has not added an about summary yet."}
            </p>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-xl font-semibold text-surface-900">Skills</h3>
            {profile.skills.length ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill.id} className="rounded-full bg-surface-100 px-3 py-1 text-sm text-surface-700">
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-surface-600">No skills added yet.</p>
            )}
          </Card>

          <ProfilePostSections
            authorName={profile.name ?? "Anonymous Professional"}
            authorImageUrl={profile.profileImageUrl}
            authorPublicProfileUrl={profile.publicProfileUrl}
            authorTrustScore={profile.trustScore}
            featuredPost={featuredPost}
            posts={posts}
            followersCount={activityFollowersCount}
            isOwner={isOwner}
            isFollowing={followStatusQuery.data?.isFollowing}
            isFollowPending={followMutation.isPending || followStatusQuery.isFetching}
            onToggleFollow={isOwner ? undefined : handleToggleFollow}
          />

          <Card className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-surface-900">Experience</h2>
              <p className="text-sm text-surface-600">
                Verified career timeline and proof-backed work history.
              </p>
            </div>

            {experiences.length ? (
              <div className="space-y-3">
                {experiences.map((experience) => (
                  <ExperienceCard key={experience.id} experience={experience} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No public experience records"
                description="This user has not published any experience entries yet."
              />
            )}
          </Card>

          <Card className="space-y-3">
            <h3 className="text-xl font-semibold text-surface-900">Education</h3>
            {education.length ? (
              <div className="space-y-2">
                {education.map((item) => (
                  <article key={item.id} className="rounded-xl border border-surface-200 bg-white p-3">
                    <p className="text-sm font-semibold text-surface-900">{item.institutionName}</p>
                    <p className="text-sm text-surface-700">{item.degree}</p>
                    <p className="mt-1 text-xs text-surface-600">
                      {formatDateTime(item.startDate)}
                      {item.endDate ? ` - ${formatDateTime(item.endDate)}` : " - Present"}
                    </p>
                    <a href={item.proofUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-trust-700 hover:text-trust-800">
                      View proof
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-surface-600">No education records yet.</p>
            )}
          </Card>

          <Card className="space-y-3">
            <h3 className="text-xl font-semibold text-surface-900">Certificates</h3>
            {certificates.length ? (
              <div className="space-y-2">
                {certificates.map((certificate) => (
                  <a
                    key={certificate.id}
                    href={certificate.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-surface-200 px-3 py-2 text-sm text-surface-700 transition-colors duration-200 hover:bg-surface-100"
                  >
                    {certificate.role} at {certificate.companyName}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-surface-600">No certificates added yet.</p>
            )}
          </Card>

          <Card className="space-y-3">
            <h3 className="text-xl font-semibold text-surface-900">Projects</h3>
            {projects.length ? (
              <div className="space-y-2">
                {projects.map((project) => (
                  <article key={project.id} className="rounded-xl border border-surface-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-surface-900">{project.title}</p>
                      <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-700">
                        {project.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-surface-700">{project.organizationName}</p>
                    {project.description ? (
                      <p className="mt-1 text-xs text-surface-600">{project.description}</p>
                    ) : null}
                    <a href={project.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-trust-700 hover:text-trust-800">
                      Open project
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-surface-600">No projects available.</p>
            )}
          </Card>

        </div>

        <aside className="space-y-4">
          <Card className="space-y-3">
            <h3 className="text-lg font-semibold text-surface-900">Suggested accounts</h3>
            <p className="text-sm text-surface-600">
              Based on this profile&apos;s industry and location.
            </p>

            {suggestedAccountsQuery.isLoading ? (
              <div className="flex justify-center py-4">
                <Spinner className="h-5 w-5" />
              </div>
            ) : null}

            {!suggestedAccountsQuery.isLoading && suggestedAccounts.length ? (
              <div className="space-y-2">
                {suggestedAccounts.map((account) => (
                  <SuggestedAccountRow
                    key={account.id}
                    account={account}
                    ctaLabel="View"
                  />
                ))}
              </div>
            ) : null}

            {!suggestedAccountsQuery.isLoading && !suggestedAccounts.length ? (
              <p className="rounded-xl bg-surface-100 px-3 py-2 text-sm text-surface-600">
                More suggestions appear as your graph grows.
              </p>
            ) : null}
          </Card>

          <Card className="space-y-3">
            <h3 className="text-lg font-semibold text-surface-900">Profiles you may be interested in</h3>
            <p className="text-sm text-surface-600">
              Professionals with similar skills and experience signals.
            </p>

            {interestedProfilesQuery.isLoading ? (
              <div className="flex justify-center py-4">
                <Spinner className="h-5 w-5" />
              </div>
            ) : null}

            {!interestedProfilesQuery.isLoading && interestedProfiles.length ? (
              <div className="space-y-2">
                {interestedProfiles.map((account) => (
                  <SuggestedAccountRow
                    key={account.id}
                    account={account}
                    ctaLabel="Open"
                  />
                ))}
              </div>
            ) : null}

            {!interestedProfilesQuery.isLoading && !interestedProfiles.length ? (
              <p className="rounded-xl bg-surface-100 px-3 py-2 text-sm text-surface-600">
                Try exploring more profiles to personalize this section.
              </p>
            ) : null}
          </Card>

          <Card className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-surface-600">
              Analytics
            </p>
            <div className="space-y-2 text-sm text-surface-700">
              <div className="flex items-center justify-between">
                <span>Profile views</span>
                <span className="font-semibold text-surface-900">{analytics.totalProfileViews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total posts</span>
                <span className="font-semibold text-surface-900">{analytics.totalPosts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total reactions</span>
                <span className="font-semibold text-surface-900">{analytics.totalReactions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total comments</span>
                <span className="font-semibold text-surface-900">{analytics.totalComments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total skills</span>
                <span className="font-semibold text-surface-900">{analytics.totalSkills}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total projects</span>
                <span className="font-semibold text-surface-900">{analytics.totalProjects}</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};
