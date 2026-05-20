import { ensureProjectConversation } from "./project-channel";
import { listPortalProjectIds } from "@/lib/portal/project-access";
import type { PortalSessionUser } from "@/lib/portal/access";

/** Sync project channels for every project linked to this portal client. */
export async function syncPortalProjectChannels(user: PortalSessionUser) {
  const projectIds = await listPortalProjectIds(user);
  for (const projectId of projectIds) {
    await ensureProjectConversation(projectId, user.id);
  }
}
