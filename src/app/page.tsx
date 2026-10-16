import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Landing } from "@/components/pomo/landing";

export default async function Page() {
  if (await getCurrentUser()) redirect("/home");
  return <Landing />;
}
