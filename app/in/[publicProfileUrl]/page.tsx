import { AppShell } from "@/components/common/AppShell";
import { PublicProfilePage } from "@/features/profile/PublicProfilePage";

interface PublicProfileRouteProps {
  params: Promise<{
    publicProfileUrl: string;
  }>;
}

export default async function PublicProfileRoute({ params }: PublicProfileRouteProps) {
  const { publicProfileUrl } = await params;

  return (
    <AppShell>
      <PublicProfilePage publicProfileUrl={publicProfileUrl} />
    </AppShell>
  );
}
