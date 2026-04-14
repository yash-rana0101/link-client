"use client";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/common/State";
import { ConnectionCard } from "@/features/connections/ConnectionCard";
import { ConnectionRequestForm } from "@/features/connections/ConnectionRequestForm";
import { PendingRequestCard } from "@/features/connections/PendingRequestCard";
import { useConnections } from "@/features/connections/useConnections";
import { useAppSelector } from "@/store/hooks";

export default function ConnectionsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const {
    connectionsQuery,
    pendingQuery,
    requestMutation,
    respondMutation,
    removeMutation,
  } = useConnections();

  if (!user) {
    return (
      <ErrorState
        title="Session unavailable"
        description="Please log in again to view your connections."
      />
    );
  }

  if (connectionsQuery.isLoading || pendingQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (connectionsQuery.isError || pendingQuery.isError) {
    return (
      <ErrorState
        title="Connections unavailable"
        description="Unable to load connection data right now."
        action={
          <Button
            onClick={() => {
              void connectionsQuery.refetch();
              void pendingQuery.refetch();
            }}
          >
            Retry
          </Button>
        }
      />
    );
  }

  const requestError = requestMutation.error?.message ?? null;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <ConnectionRequestForm
          onSubmit={(payload) => requestMutation.mutate(payload)}
          isSubmitting={requestMutation.isPending}
          errorMessage={requestError}
        />

        <div className="rounded-2xl border border-surface-300 bg-white p-4">
          <h3 className="text-lg font-semibold text-surface-900">Pending Requests</h3>
          <p className="mt-1 text-sm text-surface-600">
            Incoming requests waiting for your decision.
          </p>

          <div className="mt-4 space-y-3">
            {pendingQuery.data?.length ? (
              pendingQuery.data.map((request) => (
                <PendingRequestCard
                  key={request.id}
                  request={request}
                  onRespond={(connectionId, status) =>
                    respondMutation.mutate({ connectionId, status })
                  }
                  isPending={
                    respondMutation.isPending &&
                    respondMutation.variables?.connectionId === request.id
                  }
                />
              ))
            ) : (
              <EmptyState
                title="No pending requests"
                description="You are fully up to date."
              />
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-surface-900">Accepted Connections</h2>
        <p className="text-sm text-surface-600">
          Active trust relationships in your network.
        </p>

        <div className="mt-4 space-y-3">
          {connectionsQuery.data?.length ? (
            connectionsQuery.data.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                currentUserId={user.id}
                onRemove={(connectionId) => removeMutation.mutate(connectionId)}
                isRemoving={
                  removeMutation.isPending &&
                  removeMutation.variables === connection.id
                }
              />
            ))
          ) : (
            <EmptyState
              title="No accepted connections"
              description="Send your first request to start building your graph."
            />
          )}
        </div>
      </div>
    </section>
  );
}
