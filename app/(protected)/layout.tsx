import type { PropsWithChildren } from "react";
import { AppShell } from "@/components/common/AppShell";

export default function ProtectedLayout({ children }: PropsWithChildren) {
  return <AppShell>{children}</AppShell>;
}
