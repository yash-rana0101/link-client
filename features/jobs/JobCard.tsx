import { memo } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/date";
import type { Job } from "@/types/job";

interface JobCardProps {
  job: Job;
  onApply: (jobId: string) => void;
  isApplying: boolean;
}

const JobCardComponent = ({ job, onApply, isApplying }: JobCardProps) => (
  <Card className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-surface-900">{job.title}</h3>
        <p className="text-sm text-surface-600">
          {job.postedBy.name ?? job.postedBy.email}
        </p>
      </div>
      <Badge variant="trust">Trust {job.postedBy.trustScore}</Badge>
    </div>

    <p className="text-sm text-surface-700">{job.description}</p>

    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-surface-500">
      <span>{job.location ?? "Remote-friendly"}</span>
      <span>Posted {formatDate(job.createdAt)}</span>
      <span>{job.applicationCount} applications</span>
    </div>

    <div className="flex justify-end">
      <Button
        size="sm"
        onClick={() => onApply(job.id)}
        disabled={isApplying}
      >
        {isApplying ? "Applying..." : "Apply"}
      </Button>
    </div>
  </Card>
);

export const JobCard = memo(JobCardComponent);
