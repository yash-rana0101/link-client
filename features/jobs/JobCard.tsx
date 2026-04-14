/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
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

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ZT";

const JobCardComponent = ({ job, onApply, isApplying }: JobCardProps) => {
  const posterName = job.postedBy.name ?? job.postedBy.email;
  const profileHref = job.postedBy.publicProfileUrl
    ? `/in/${job.postedBy.publicProfileUrl}`
    : null;

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-surface-900">{job.title}</h3>
          <div className="mt-1 flex items-center gap-2">
            {profileHref ? (
              <Link
                href={profileHref}
                className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-[10px] font-semibold text-surface-700"
              >
                {job.postedBy.profileImageUrl ? (
                  <img
                    src={job.postedBy.profileImageUrl}
                    alt={posterName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(posterName)
                )}
              </Link>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-surface-300 bg-surface-100 text-[10px] font-semibold text-surface-700">
                {job.postedBy.profileImageUrl ? (
                  <img
                    src={job.postedBy.profileImageUrl}
                    alt={posterName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(posterName)
                )}
              </div>
            )}
            {profileHref ? (
              <Link
                href={profileHref}
                className="text-sm text-surface-600 transition-colors duration-200 hover:text-trust-700"
              >
                {posterName}
              </Link>
            ) : (
              <p className="text-sm text-surface-600">{posterName}</p>
            )}
          </div>
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
};

export const JobCard = memo(JobCardComponent);
