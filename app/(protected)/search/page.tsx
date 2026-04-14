"use client";

import dynamic from "next/dynamic";

const SearchPage = dynamic(() => import("@/features/search/SearchPage"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-surface-300 bg-white p-6 text-sm text-surface-600">
      Loading search...
    </div>
  ),
});

export default function SearchRoute() {
  return <SearchPage />;
}
