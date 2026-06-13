import { redirect } from "next/navigation";
import { WorkspaceClient } from "@/components/workspace-client";
import { toolTemplates } from "@/features/tools/templates";
import { providerOptions } from "@/features/providers";
import { auth } from "@/lib/auth/config";

export default async function WorkspacePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <WorkspaceClient
      userName={session.user.name ?? session.user.email ?? "用户"}
      tools={toolTemplates}
      providers={providerOptions}
    />
  );
}
