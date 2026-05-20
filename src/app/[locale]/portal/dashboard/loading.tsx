import { AdminListSkeleton } from "@/components/admin/admin-list-skeleton";

export default function Loading() {
  return <AdminListSkeleton statCards={4} tableRows={5} />;
}
