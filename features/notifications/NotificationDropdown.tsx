"use client";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatDateTime } from "@/lib/date";
import { useNotifications } from "@/features/notifications/useNotifications";
import {
  setNotificationPanelOpen,
  toggleNotificationPanel,
} from "@/store/slices/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export const NotificationDropdown = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.notificationPanelOpen);
  const { notificationsQuery, markReadMutation, unreadCount } = useNotifications();

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => dispatch(toggleNotificationPanel())}
      >
        Notifications
        {unreadCount ? (
          <span className="ml-2 rounded-full bg-trust-600 px-2 py-0.5 text-xs text-white">
            {unreadCount}
          </span>
        ) : null}
      </Button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-surface-300 bg-white p-3 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-900">Recent updates</h3>
            <button
              type="button"
              className="text-xs text-surface-500 hover:text-surface-700"
              onClick={() => dispatch(setNotificationPanelOpen(false))}
            >
              Close
            </button>
          </div>

          {notificationsQuery.isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : null}

          {notificationsQuery.data?.length ? (
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {notificationsQuery.data.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-surface-200 p-3 text-left hover:bg-surface-100"
                    onClick={() => {
                      if (!notification.isRead) {
                        markReadMutation.mutate(notification.id);
                      }
                    }}
                  >
                    <p className="text-sm text-surface-800">{notification.message}</p>
                    <p className="mt-1 text-xs text-surface-500">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {!notificationsQuery.isLoading && !notificationsQuery.data?.length ? (
            <p className="rounded-xl bg-surface-100 px-3 py-4 text-center text-sm text-surface-600">
              No notifications right now.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
