"use client";

import dynamic from "next/dynamic";

const ProfilePage = dynamic(() => import("@/features/profile/ProfilePage"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-surface-300 bg-white p-6 text-sm text-surface-600">
      Loading profile...
    </div>
  ),
});

export default function ProfileRoute() {
  return <ProfilePage />;
}
