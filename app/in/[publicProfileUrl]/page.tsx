"use client";

import dynamic from "next/dynamic";

const PublicProfilePage = dynamic(
  () => import("@/features/profile/PublicProfilePage").then((mod) => mod.PublicProfilePage),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-surface-600">
        Loading public profile...
      </div>
    ),
  },
);

interface PublicProfileRouteProps {
  params: {
    publicProfileUrl: string;
  };
}

export default function PublicProfileRoute({ params }: PublicProfileRouteProps) {
  return <PublicProfilePage publicProfileUrl={params.publicProfileUrl} />;
}
