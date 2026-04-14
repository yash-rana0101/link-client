import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import type { CompleteProfile } from "@/types/profile";

interface ProfileCardProps {
  data: CompleteProfile;
}

export const ProfileCard = ({ data }: ProfileCardProps) => {
  const { profile, stats } = data;

  return (
    <Card className="h-fit">
      <CardHeader className="mb-0 block">
        <CardTitle>{profile.name ?? "Anonymous Professional"}</CardTitle>
        <p className="mt-1 text-sm text-surface-600">{profile.headline ?? profile.email}</p>
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
