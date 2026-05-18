import { revalidatePath } from "next/cache";

export function revalidateSitePaths(): void {
  revalidatePath("/", "layout");
  revalidatePath("/sq", "layout");
  revalidatePath("/en", "layout");
  for (const locale of ["", "/sq", "/en"]) {
    revalidatePath(`${locale}/sherbime`);
    revalidatePath(`${locale}/kontakt`);
    revalidatePath(`${locale}`);
  }
}
