import { revalidatePath } from "next/cache";

export function revalidateProjectPaths(projectId?: string) {
  revalidatePath("/admin/projects");
  revalidatePath("/en/admin/projects");
  if (projectId) {
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/en/admin/projects/${projectId}`);
  }
}
