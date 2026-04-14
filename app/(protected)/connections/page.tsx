"use client";

import dynamic from "next/dynamic";

const ConnectionsPage = dynamic(
  () => import("@/features/connections/ConnectionsPage"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-surface-300 bg-white p-6 text-sm text-surface-600">
        Loading connections...
      </div>
    ),
  },
);

export default function ConnectionsRoute() {
  return <ConnectionsPage />;
}
