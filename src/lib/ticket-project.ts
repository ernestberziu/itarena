/** Project tickets are owned by the project team, not a single staff assignee. */
export function ticketStaffAssigneeBlocked(projectId: string | null | undefined): boolean {
  return Boolean(projectId?.trim());
}

export const TICKET_PROJECT_STAFF_CONFLICT =
  "Project tickets cannot be assigned to individual staff. Use the project team instead.";
