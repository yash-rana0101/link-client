/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { CompleteProfile } from "@/types/profile";

interface ProfileCardProps {
  data: CompleteProfile;
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

export const ProfileCard = ({ data }: ProfileCardProps) => {
  const { profile, stats, experiences, certificates } = data;
  const publicPath = profile.publicProfileUrl ? `/in/${profile.publicProfileUrl}` : null;
  const topExperience = experiences[0] ?? null;
  const topCertificate = certificates[0] ?? null;
  const roleLine = [profile.currentRole, profile.location].filter(Boolean).join(" · ");

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

  return (
    <Card className="overflow-hidden p-0">
      <div
        className="h-52 bg-linear-to-r from-surface-200 via-surface-100 to-trust-100 sm:h-60"
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
                  alt={profile.name ?? "Profile"}
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
              </div>

              <p className="mt-1 text-base text-surface-900">
                {profile.headline ?? profile.currentRole ?? profile.email}
              </p>

              <p className="mt-2 text-sm text-surface-600">
                {roleLine || "Update your role and location"}
                <span className="mx-1 text-surface-300">•</span>
                <Link href="/profile" className="font-semibold text-trust-700 hover:underline">
                  Contact info
                </Link>
              </p>

              <p className="mt-2 text-sm text-surface-600">
                <span className="font-semibold text-trust-700 hover:underline cursor-pointer">{toConnectionsLabel(stats.totalConnections)}</span>
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/profile"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-trust-600 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-trust-700"
                >
                  Edit profile
                </Link>

                <Link
                  href={publicPath ?? "/profile"}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-surface-400 px-4 text-sm font-semibold text-surface-700 transition-colors duration-200 hover:bg-surface-50"
                >
                  {publicPath ? "View public profile" : "Set public profile"}
                </Link>
              </div>
            </div>
          </div>

          {organizationRows.length ? (
            <div className="mt-4 sm:mt-24 sm:min-w-[200px] max-w-sm space-y-4">
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
          {publicPath ? (
            <span className="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium text-surface-700">
              Public URL: {publicPath}
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
  );
};
