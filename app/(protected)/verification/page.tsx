"use client";

import dynamic from "next/dynamic";

const VerificationPage = dynamic(
  () => import("@/features/verification/VerificationPage"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-surface-300 bg-white p-6 text-sm text-surface-600">
        Loading verification...
      </div>
    ),
  },
);

export default function VerificationRoute() {
  return <VerificationPage />;
}
