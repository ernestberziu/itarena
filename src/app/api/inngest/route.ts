import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { slaChecker, autoCloseResolved } from "@/inngest/sla-checker";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [slaChecker, autoCloseResolved],
});
