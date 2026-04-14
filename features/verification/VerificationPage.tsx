"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/common/State";
import { useVerification } from "@/features/verification/useVerification";
import { useAppSelector } from "@/store/hooks";

const statusBadgeVariant = (status: string) => {
  if (status === "APPROVED") {
    return "trust" as const;
  }

  if (status === "REJECTED") {
    return "warning" as const;
  }

  return "neutral" as const;
};

export default function VerificationPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>("");
  const [selectedVerifierIds, setSelectedVerifierIds] = useState<string[]>([]);

  const { profileQuery, statusQuery, requestMutation, respondMutation } =
    useVerification(selectedExperienceId || undefined);

  const selectedExperience = useMemo(
    () =>
      profileQuery.data?.experiences.find(
        (experience) => experience.id === selectedExperienceId,
      ) ?? null,
    [profileQuery.data, selectedExperienceId],
  );

  if (!user) {
    return (
      <ErrorState
        title="Session unavailable"
        description="Please log in again to manage verifications."
      />
    );
  }

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
        title="Verification unavailable"
        description="Unable to load profile and verification context."
        action={<Button onClick={() => profileQuery.refetch()}>Retry</Button>}
      />
    );
  }

  const potentialVerifiers = profileQuery.data.connections;

  const requestError = requestMutation.error?.message ?? null;
  const respondError = respondMutation.error?.message ?? null;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-surface-900">
              Request Verification
            </h2>
            <p className="text-sm text-surface-600">
              Choose one of your experiences and trusted peers as verifiers.
            </p>
          </div>

          {profileQuery.data.experiences.length ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-700">
                  Experience
                </label>
                <select
                  className="h-11 w-full rounded-xl border border-surface-300 bg-white px-3 text-sm text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-500"
                  value={selectedExperienceId}
                  onChange={(event) => {
                    setSelectedExperienceId(event.target.value);
                    setSelectedVerifierIds([]);
                  }}
                >
                  <option value="">Select experience</option>
                  {profileQuery.data.experiences.map((experience) => (
                    <option key={experience.id} value={experience.id}>
                      {experience.companyName} - {experience.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-surface-700">Verifiers</p>
                {potentialVerifiers.length ? (
                  <div className="space-y-2">
                    {potentialVerifiers.map((connection) => {
                      const checked = selectedVerifierIds.includes(
                        connection.otherUser.id,
                      );

                      return (
                        <label
                          key={connection.id}
                          className="flex items-center justify-between rounded-lg border border-surface-200 px-3 py-2"
                        >
                          <span className="text-sm text-surface-800">
                            {connection.otherUser.name ?? connection.otherUser.email}
                          </span>
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-trust-600"
                            checked={checked}
                            onChange={() => {
                              setSelectedVerifierIds((current) =>
                                checked
                                  ? current.filter(
                                    (verifierId) =>
                                      verifierId !== connection.otherUser.id,
                                  )
                                  : [...current, connection.otherUser.id],
                              );
                            }}
                          />
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-lg bg-surface-100 px-3 py-2 text-sm text-surface-600">
                    You need accepted connections before requesting verification.
                  </p>
                )}
              </div>

              {requestError ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {requestError}
                </p>
              ) : null}

              {requestMutation.data ? (
                <p className="rounded-lg bg-trust-50 px-3 py-2 text-sm text-trust-700">
                  Requested {requestMutation.data.requestedCount} verifier(s).
                </p>
              ) : null}

              <Button
                type="button"
                disabled={
                  requestMutation.isPending ||
                  !selectedExperienceId ||
                  selectedVerifierIds.length === 0
                }
                onClick={() => {
                  requestMutation.mutate({
                    experienceId: selectedExperienceId,
                    verifierIds: selectedVerifierIds,
                  });
                }}
              >
                {requestMutation.isPending
                  ? "Sending request..."
                  : "Request Verification"}
              </Button>
            </>
          ) : (
            <EmptyState
              title="No experiences available"
              description="Add experience entries first, then request peer verification."
            />
          )}
        </Card>

        <Card className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-surface-900">Verification Status</h3>
            {selectedExperience ? (
              <p className="text-sm text-surface-600">
                {selectedExperience.companyName} - {selectedExperience.role}
              </p>
            ) : null}
          </div>

          {statusQuery.isLoading ? (
            <div className="flex h-24 items-center justify-center">
              <Spinner />
            </div>
          ) : null}

          {statusQuery.data ? (
            <>
              <div className="rounded-xl bg-surface-100 p-3 text-sm text-surface-700">
                <p>
                  Approvals: {statusQuery.data.approvalsReceived}/
                  {statusQuery.data.approvalsRequired}
                </p>
                <p className="mt-1">
                  Experience status: {statusQuery.data.experienceStatus.replaceAll("_", " ")}
                </p>
              </div>

              <div className="space-y-2">
                {statusQuery.data.verifications.length ? (
                  statusQuery.data.verifications.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-surface-200 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-surface-800">
                          {item.verifier.name ?? item.verifier.id}
                        </p>
                        <Badge variant={statusBadgeVariant(item.status)}>
                          {item.status}
                        </Badge>
                      </div>

                      {item.status === "PENDING" && item.verifierId === user.id ? (
                        <div className="mt-2 flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              respondMutation.mutate({
                                experienceId: item.experienceId,
                                status: "APPROVED",
                              })
                            }
                            disabled={respondMutation.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              respondMutation.mutate({
                                experienceId: item.experienceId,
                                status: "REJECTED",
                              })
                            }
                            disabled={respondMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg bg-surface-100 px-3 py-2 text-sm text-surface-600">
                    No verification requests yet for this experience.
                  </p>
                )}
              </div>

              {respondError ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {respondError}
                </p>
              ) : null}
            </>
          ) : (
            <p className="rounded-lg bg-surface-100 px-3 py-2 text-sm text-surface-600">
              Select an experience to view verification progress.
            </p>
          )}
        </Card>
      </div>
    </section>
  );
}
