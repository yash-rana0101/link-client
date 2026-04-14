"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/common/State";
import { Spinner } from "@/components/ui/Spinner";
import { ExperienceCard } from "@/features/profile/ExperienceCard";
import { usePublicProfile } from "@/features/profile/useProfile";

interface PublicProfilePageProps {
  publicProfileUrl: string;
}

export const PublicProfilePage = ({ publicProfileUrl }: PublicProfilePageProps) => {
  const profileQuery = usePublicProfile(publicProfileUrl);

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

  const { profile, stats, experiences } = profileQuery.data;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <Card className="h-fit space-y-3">
          <div
            className="h-24 rounded-xl border border-surface-300 bg-cover bg-center"
            style={
              profile.profileBannerUrl
                ? { backgroundImage: `url(${profile.profileBannerUrl})` }
                : undefined
            }
          >
            {!profile.profileBannerUrl ? (
              <div className="flex h-full items-center justify-center text-xs text-surface-500">
                No banner uploaded
              </div>
            ) : null}
          </div>

          <div className="flex items-start gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-full border border-surface-300 bg-surface-100">
              {profile.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt={profile.name ?? "Public profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-surface-500">
                  {(profile.name ?? "ZT").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold text-surface-900">
                {profile.name ?? "Anonymous Professional"}
              </h1>
              <p className="mt-1 text-sm text-surface-600">{profile.headline ?? "Professional profile"}</p>
              {profile.currentRole ? (
                <p className="mt-1 text-sm text-surface-600">{profile.currentRole}</p>
              ) : null}
            </div>
          </div>

          {profile.about ? (
            <p className="text-sm text-surface-700">{profile.about}</p>
          ) : null}

          {profile.skills.length ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-surface-200 px-2.5 py-1 text-xs font-medium text-surface-700"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          ) : null}
        </Card>

        <Card className="space-y-2">
          <p className="text-sm font-semibold text-surface-900">Trust Snapshot</p>
          <p className="text-sm text-surface-600">Trust score: {profile.trustScore}</p>
          <p className="text-sm text-surface-600">Connections: {stats.totalConnections}</p>
          <p className="text-sm text-surface-600">Experiences: {stats.totalExperiences}</p>
          <p className="text-sm text-surface-600">Verified experiences: {stats.verifiedExperiences}</p>
        </Card>

        <Link href="/login" className="inline-block text-sm font-medium text-trust-700 hover:text-trust-800">
          Join ZeroTrust Network
        </Link>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-surface-900">Experience</h2>
          <p className="text-sm text-surface-600">Verifiable work history and attached proof.</p>
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
      </div>
    </div>
  );
};
