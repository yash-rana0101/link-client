"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/common/State";
import { ExperienceCard } from "@/features/profile/ExperienceCard";
import { ProfileEditorCard } from "@/features/profile/ProfileEditorCard";
import { ProfileCard } from "@/features/profile/ProfileCard";
import { useProfile } from "@/features/profile/useProfile";

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
  const { profileQuery, guideQuery } = useProfile();

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

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <ProfileCard data={profileQuery.data} />
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
      </div>

      <div className="space-y-4">
        <ProfileEditorCard profile={profileQuery.data.profile} />

        <div>
          <h2 className="text-xl font-semibold text-surface-900">Experience</h2>
          <p className="text-sm text-surface-600">
            Professional history and evidence-backed artifacts.
          </p>
        </div>

        {profileQuery.data.experiences.length ? (
          <div className="space-y-3">
            {profileQuery.data.experiences.map((experience) => (
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
            {profileQuery.data.connections.length} accepted relationships in your
            trust graph.
          </p>
        </Card>
      </div>
    </div>
  );
}
