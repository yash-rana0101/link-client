import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const hasSession = (await cookies()).get("zt_session")?.value === "1";
  redirect(hasSession ? "/feed" : "/login");
}
