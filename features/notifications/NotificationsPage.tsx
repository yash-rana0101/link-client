"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/common/State";
import { formatDateTime } from "@/lib/date";
import { useNotifications } from "@/features/notifications/useNotifications";

export default function NotificationsPage() {
  const { notificationsQuery, markReadMutation } = useNotifications();

  if (notificationsQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (notificationsQuery.isError) {
    return (
      <ErrorState
        title="Notifications unavailable"
        description="Try refreshing in a moment."
        action={<Button onClick={() => notificationsQuery.refetch()}>Retry</Button>}
      />
    );
  }

  if (!notificationsQuery.data?.length) {
    return (
      <EmptyState
        title="No notifications"
        description="You are all caught up for now."
      />
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-surface-900">Notifications</h2>
        <p className="text-sm text-surface-600">
          Realtime updates from your trust network.
        </p>
      </div>

      {notificationsQuery.data.map((notification) => (
        <Card key={notification.id} className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-sm text-surface-800">{notification.message}</p>
            {!notification.isRead ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => markReadMutation.mutate(notification.id)}
                disabled={markReadMutation.isPending}
              >
                Mark read
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-surface-500">
            {formatDateTime(notification.createdAt)}
          </p>
        </Card>
      ))}
    </section>
  );
}
