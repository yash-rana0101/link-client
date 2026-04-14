"use client";

import dynamic from "next/dynamic";

const MessagingPage = dynamic(() => import("@/features/messaging/MessagingPage"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-surface-300 bg-white p-6 text-sm text-surface-600">
      Loading messaging...
    </div>
  ),
});

export default function MessagingRoute() {
  return <MessagingPage />;
}
