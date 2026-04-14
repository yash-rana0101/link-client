import { memo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/date";
import type { Experience } from "@/types/profile";

interface ExperienceCardProps {
  experience: Experience;
}

const statusToVariant = (status: Experience["status"]) => {
  if (status === "FULLY_VERIFIED" || status === "PEER_VERIFIED") {
    return "trust" as const;
  }

  if (status === "FLAGGED") {
    return "warning" as const;
  }

  return "neutral" as const;
};

const ExperienceCardComponent = ({ experience }: ExperienceCardProps) => (
  <Card className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h4 className="font-semibold text-surface-900">{experience.role}</h4>
        <p className="text-sm text-surface-600">{experience.companyName}</p>
      </div>
      <Badge variant={statusToVariant(experience.status)}>
        {experience.status.replaceAll("_", " ")}
      </Badge>
    </div>

    <p className="text-sm text-surface-600">
      {formatDate(experience.startDate)} -{" "}
      {experience.endDate ? formatDate(experience.endDate) : "Present"}
    </p>

    {experience.description ? (
      <p className="text-sm text-surface-700">{experience.description}</p>
    ) : null}

    {experience.artifacts.length ? (
      <div className="flex flex-wrap gap-2">
        {experience.artifacts.map((artifact) => (
          <a
            key={artifact.id}
            href={artifact.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-surface-200 px-2 py-1 text-xs font-medium text-surface-700 hover:bg-surface-300"
          >
            {artifact.type}
          </a>
        ))}
      </div>
    ) : null}
  </Card>
);

export const ExperienceCard = memo(ExperienceCardComponent);
