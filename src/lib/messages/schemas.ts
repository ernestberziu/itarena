import { z } from "zod";
import { CONVERSATION_TYPES } from "./types";

export const createConversationSchema = z
  .object({
    type: z.enum(["DIRECT", "GROUP"]),
    title: z.string().min(1).max(200).optional(),
    participantIds: z.array(z.string().min(1)).min(1).max(50),
    projectId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "DIRECT" && data.participantIds.length !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "Direct conversations require exactly one other participant",
        path: ["participantIds"],
      });
    }
    if (data.type === "GROUP" && data.participantIds.length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Group conversations require at least two other participants",
        path: ["participantIds"],
      });
    }
    if (data.type === "GROUP" && !data.title?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Group title is required",
        path: ["title"],
      });
    }
  });

export const updateConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  addParticipantIds: z.array(z.string().min(1)).optional(),
  removeParticipantIds: z.array(z.string().min(1)).optional(),
});

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(50000),
  isInternal: z.boolean().optional().default(false),
});

export const listConversationsQuerySchema = z.object({
  projectId: z.string().optional(),
  type: z.enum(CONVERSATION_TYPES).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
