"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/common/State";
import { ExperienceCard } from "@/features/profile/ExperienceCard";
import { ProfileEditorCard } from "@/features/profile/ProfileEditorCard";
import { ProfileCard } from "@/features/profile/ProfileCard";
import { ProfilePostSections } from "@/features/profile/ProfilePostSections";
import { useProfile } from "@/features/profile/useProfile";
import { formatDateTime } from "@/lib/date";

const guideColor = (percent?: number) => {
  if (!percent) {
    return "bg-surface-300";
  }

  if (percent > 80) {
    return "bg-trust-600";
  }

  if (percent > 50) {
    return "bg-amber-500";
  }

  return "bg-red-500";
};

const guideWidthClass = (percent?: number) => {
  if (!percent || percent <= 0) {
    return "w-0";
  }

  if (percent >= 100) {
    return "w-full";
  }

  if (percent >= 90) {
    return "w-11/12";
  }

  if (percent >= 80) {
    return "w-10/12";
  }

  if (percent >= 70) {
    return "w-9/12";
  }

  if (percent >= 60) {
    return "w-8/12";
  }

  if (percent >= 50) {
    return "w-7/12";
  }

  if (percent >= 40) {
    return "w-6/12";
  }

  if (percent >= 30) {
    return "w-5/12";
  }

  if (percent >= 20) {
    return "w-4/12";
  }

  if (percent >= 10) {
    return "w-3/12";
  }

  return "w-2/12";
};

export default function ProfilePage() {
  const { profileQuery, guideQuery, profileViewsQuery } = useProfile();

  if (profileQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        title="Profile could not be loaded"
        description="Try again in a moment."
        action={<Button onClick={() => profileQuery.refetch()}>Retry</Button>}
      />
    );
  }

  const guidePercent = guideQuery.data?.completion.percent;
  const {
    profile,
    analytics,
    experiences,
    certificates,
    education,
    projects,
    featuredPost,
    posts,
    connections,
  } = profileQuery.data;

  return (
    <div className="space-y-6">
      <ProfileCard data={profileQuery.data} />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Card>
            <p className="text-sm font-semibold text-surface-900">Profile Completion</p>
            <div className="mt-3 h-2 w-full rounded-full bg-surface-200">
              <div
                className={`h-2 rounded-full transition-all ${guideColor(guidePercent)} ${guideWidthClass(guidePercent)}`}
              />
            </div>
            <p className="mt-2 text-sm text-surface-600">
              {guidePercent ?? 0}% complete
            </p>
            {guideQuery.data?.feedback ? (
              <p className="mt-3 text-sm text-surface-700">{guideQuery.data.feedback}</p>
            ) : null}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-surface-900">Analytics</h3>
            <div className="mt-3 space-y-2 text-sm text-surface-700">
              <div className="flex items-center justify-between">
                <span>Total profile views</span>
                <span className="font-semibold">{analytics.totalProfileViews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total reactions</span>
                <span className="font-semibold">{analytics.totalReactions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total comments</span>
                <span className="font-semibold">{analytics.totalComments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total skills</span>
                <span className="font-semibold">{analytics.totalSkills}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total projects</span>
                <span className="font-semibold">{analytics.totalProjects}</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-surface-900">Who viewed your profile</p>
              {profileViewsQuery.isFetching ? (
                <span className="text-xs text-surface-500">Refreshing...</span>
              ) : null}
            </div>

            {profileViewsQuery.isLoading ? (
              <div className="mt-3 flex items-center justify-center py-4">
                <Spinner className="h-5 w-5" />
              </div>
            ) : null}

            {profileViewsQuery.isError ? (
              <p className="mt-3 text-sm text-surface-600">
                Unable to load profile viewers right now.
              </p>
            ) : null}

            {profileViewsQuery.data?.length ? (
              <ul className="mt-3 space-y-2">
                {profileViewsQuery.data.slice(0, 6).map((entry) => {
                  const name = entry.viewer.name ?? "Anonymous professional";
                  const subtitle = [entry.viewer.currentRole, entry.viewer.location]
                    .filter(Boolean)
                    .join(" · ");
                  const profilePath = entry.viewer.publicProfileUrl
                    ? `/in/${entry.viewer.publicProfileUrl}`
                    : null;

                  return (
                    <li key={entry.viewer.id} className="rounded-xl border border-surface-200 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {profilePath ? (
                            <Link href={profilePath} className="text-sm font-medium text-trust-700 hover:text-trust-800">
                              {name}
                            </Link>
                          ) : (
                            <p className="text-sm font-medium text-surface-800">{name}</p>
                          )}
                          {subtitle ? (
                            <p className="mt-1 truncate text-xs text-surface-600">{subtitle}</p>
                          ) : null}
                          <p className="mt-1 text-xs text-surface-500">
                            Last viewed: {formatDateTime(entry.lastViewedAt)}
                          </p>
                        </div>
                        <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-700">
                          {entry.viewCount} views
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {!profileViewsQuery.isLoading && !profileViewsQuery.isError && !profileViewsQuery.data?.length ? (
              <p className="mt-3 text-sm text-surface-600">
                No profile views yet. Share your public profile URL to increase visibility.
              </p>
            ) : null}
          </Card>
        </div>

        <div className="space-y-4">
          <ProfileEditorCard profile={profileQuery.data.profile} />

          <Card className="space-y-3">
            <h3 className="text-lg font-semibold text-surface-900">Skills</h3>
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
            followersCount={analytics.totalConnections}
            isOwner
          />

          <Card className="space-y-3">
            <h3 className="text-lg font-semibold text-surface-900">Education</h3>
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
            <h3 className="text-lg font-semibold text-surface-900">Certificates</h3>
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
            <h3 className="text-lg font-semibold text-surface-900">Projects</h3>
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
              <p className="text-sm text-surface-600">No projects added yet.</p>
            )}
          </Card>

          <div>
            <h2 className="text-xl font-semibold text-surface-900">Experience</h2>
            <p className="text-sm text-surface-600">
              Professional history and evidence-backed artifacts.
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
              title="No experiences yet"
              description="Add your first role to start building trust context."
            />
          )}

          <Card>
            <h3 className="text-lg font-semibold text-surface-900">Connections</h3>
            <p className="mt-2 text-sm text-surface-600">
              {connections.length} accepted relationships in your
              trust graph.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
