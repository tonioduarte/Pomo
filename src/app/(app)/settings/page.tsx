import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/pomo/profile-form";
import { PageHeader } from "@/components/pomo/widgets";

export const metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:py-10">
      <PageHeader eyebrow="seu cantinho" title="Configurações" />
      <section className="sticker p-5 sm:p-8">
        <ProfileForm user={user} />
      </section>
      <section className="sticker mt-6 flex items-center justify-between gap-4 p-5">
        <div>
          <p className="font-extrabold">{user.email}</p>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
        <form action={logout}>
          <Button variant="outline">
            <LogOut /> Sair
          </Button>
        </form>
      </section>
    </div>
  );
}
