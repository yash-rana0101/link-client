/* eslint-disable @next/next/no-img-element */

import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import type { CompleteProfile } from "@/types/profile";

interface ProfileCardProps {
  data: CompleteProfile;
}

export const ProfileCard = ({ data }: ProfileCardProps) => {
  const { profile, stats } = data;
  const publicPath = profile.publicProfileUrl ? `/in/${profile.publicProfileUrl}` : null;

  return (
    <Card className="h-fit">
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
            Add a profile banner
          </div>
        ) : null}
      </div>

      <CardHeader className="mb-0 mt-3 block">
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-full border border-surface-300 bg-surface-100">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={profile.name ?? "Profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs font-semibold text-surface-500">
                {(profile.name ?? "ZT").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <CardTitle>{profile.name ?? "Anonymous Professional"}</CardTitle>
            <p className="mt-1 text-sm text-surface-600">{profile.headline ?? profile.email}</p>
            {profile.currentRole ? (
              <p className="mt-1 text-sm text-surface-600">{profile.currentRole}</p>
            ) : null}
          </div>
        </div>

        {publicPath ? (
          <a
            href={publicPath}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm font-medium text-trust-700 hover:text-trust-800"
          >
            {publicPath}
          </a>
        ) : null}

        {profile.about ? (
          <p className="mt-3 text-sm text-surface-700">{profile.about}</p>
        ) : null}
      </CardHeader>

      <CardBody>
        <div className="rounded-xl bg-trust-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-trust-700">
            Trust Score
          </p>
          <p className="mt-1 text-2xl font-bold text-trust-700">{profile.trustScore}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-surface-100 p-3">
            <p className="text-surface-500">Connections</p>
            <p className="font-semibold text-surface-900">{stats.totalConnections}</p>
          </div>
          <div className="rounded-xl bg-surface-100 p-3">
            <p className="text-surface-500">Posts</p>
            <p className="font-semibold text-surface-900">{stats.totalPosts}</p>
          </div>
          <div className="rounded-xl bg-surface-100 p-3">
            <p className="text-surface-500">Experiences</p>
            <p className="font-semibold text-surface-900">{stats.totalExperiences}</p>
          </div>
          <div className="rounded-xl bg-surface-100 p-3">
            <p className="text-surface-500">Certificates</p>
            <p className="font-semibold text-surface-900">{stats.certificateCount}</p>
          </div>
        </div>

        {profile.skills.length ? (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-surface-700">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill.id} variant="neutral">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
};
