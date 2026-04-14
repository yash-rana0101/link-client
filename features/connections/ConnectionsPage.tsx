"use client";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/common/State";
import { ConnectionCard } from "@/features/connections/ConnectionCard";
import { PendingRequestCard } from "@/features/connections/PendingRequestCard";
import { useConnections } from "@/features/connections/useConnections";
import { useAppSelector } from "@/store/hooks";

export default function ConnectionsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const {
    connectionsQuery,
    pendingQuery,
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

  const pendingRequests = pendingQuery.data ?? [];
  const acceptedConnections = connectionsQuery.data ?? [];
  const manageItems = [
    { label: "Connections", value: String(acceptedConnections.length), marker: "C" },
    { label: "Invitations", value: String(pendingRequests.length), marker: "I" },
    { label: "Verification", value: "Active", marker: "V" },
    { label: "Messages", value: "Ready", marker: "M" },
  ];

  return (
    <section className="grid gap-5 lg:grid-cols-[18.75rem_1fr]">
      <aside className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-surface-300 bg-white">
          <div className="border-b border-surface-200 px-4 py-4">
            <h2 className="text-lg font-semibold text-surface-900">Manage network</h2>
          </div>

          <div className="divide-y divide-surface-200">
            {manageItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-surface-300 bg-surface-100 text-xs font-semibold text-surface-700">
                    {item.marker}
                  </span>
                  <span className="text-sm font-medium text-surface-800">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-surface-600">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="space-y-4">

        <div className="overflow-hidden rounded-2xl border border-surface-300 bg-white">
          <div className="flex items-center justify-between border-b border-surface-200 px-4 py-4">
            <h3 className="text-lg font-semibold text-surface-900">
              Invitations ({pendingRequests.length})
            </h3>
            {pendingRequests.length > 3 ? (
              <button
                type="button"
                className="text-sm font-semibold text-brand-600 transition hover:text-brand-700"
              >
                Show all
              </button>
            ) : null}
          </div>

          {pendingRequests.length ? (
            <div className="divide-y divide-surface-200">
              {pendingRequests.map((request) => (
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
              ))}
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No pending invitations"
                description="New connection requests will show up here."
              />
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-300 bg-white">
          <div className="border-b border-surface-200 px-4 py-4">
            <h3 className="text-lg font-semibold text-surface-900">Your trusted connections</h3>
            <p className="text-sm text-surface-600">
              Active trust relationships in your network.
            </p>
          </div>

          {acceptedConnections.length ? (
            <div className="divide-y divide-surface-200">
              {acceptedConnections.map((connection) => (
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
              ))}
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No accepted connections"
                description="Send your first request to start building your graph."
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
