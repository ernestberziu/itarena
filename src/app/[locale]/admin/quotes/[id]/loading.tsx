import { AdminListSkeleton } from "@/components/admin/admin-list-skeleton";

export default function Loading() {
  return <AdminListSkeleton statCards={0} tableRows={6} />;
}
