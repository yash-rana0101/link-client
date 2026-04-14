"use client";

import dynamic from "next/dynamic";

const FeedPage = dynamic(() => import("@/features/feed/FeedPage"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-surface-300 bg-white p-6 text-sm text-surface-600">
      Loading feed...
    </div>
  ),
});

export default function FeedRoute() {
  return <FeedPage />;
}
