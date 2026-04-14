"use client";

import dynamic from "next/dynamic";

const NotificationsPage = dynamic(
  () => import("@/features/notifications/NotificationsPage"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-surface-300 bg-white p-6 text-sm text-surface-600">
        Loading notifications...
      </div>
    ),
  },
);

export default function NotificationsRoute() {
  return <NotificationsPage />;
}
