import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { ContractParty } from "@/lib/templates/types";
import type { DocumentListRow } from "@/app/api/admin/templates/documents/route";

export async function loadAdminDocumentsList(params: {
  type?: string | null;
  status?: string | null;
  q?: string | null;
  skip?: number;
  take?: number;
}): Promise<{ items: DocumentListRow[]; total: number }> {
  const where: Prisma.ContractDocumentWhereInput = {};
  if (params.type) where.type = params.type;
  if (params.status) where.status = params.status;

  const docs = await db.contractDocument.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  const q = params.q?.trim().toLowerCase();
  const filtered = q
    ? docs.filter((d) => {
        const party = d.partyJson as ContractParty;
        const num = d.documentNumber.toLowerCase();
        return (
          num.includes(q) ||
          party.fullName?.toLowerCase().includes(q) ||
          party.companyName?.toLowerCase().includes(q)
        );
      })
    : docs;

  const total = filtered.length;
  const skip = params.skip ?? 0;
  const take = params.take ?? total;
  const slice = filtered.slice(skip, skip + take);

  const items: DocumentListRow[] = slice.map((d) => ({
    id: d.id,
    documentNumber: d.documentNumber,
    type: d.type,
    status: d.status,
    language: d.language,
    partyJson: d.partyJson as ContractParty,
    pdfUrl: d.pdfUrl,
    createdAt: d.createdAt.toISOString(),
  }));

  return { items, total };
}
