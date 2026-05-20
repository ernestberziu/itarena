/**
 * Smoke tests for `resolveEffectiveAcl` (run: `npm run test:acl`).
 */
import { ADMIN_FEATURES, hasAclLevel } from "../src/lib/admin-acl/features";
import { resolveEffectiveAcl } from "../src/lib/admin-acl/resolve";

function assert(cond: boolean, message: string): void {
  if (!cond) throw new Error(message);
}

const admin = resolveEffectiveAcl({ role: "ADMIN", adminAclJson: { tickets: "none" } });
for (const f of ADMIN_FEATURES) {
  assert(admin[f] === "write", `ADMIN should be write for ${f} (ignores overlay)`);
}

const engineer = resolveEffectiveAcl({ role: "ENGINEER", adminAclJson: null });
assert(engineer.tickets === "write", "ENGINEER default tickets");
assert(engineer.clients === "none", "ENGINEER default clients");
assert(hasAclLevel(engineer, "dashboard", "write"), "ENGINEER dashboard write");

const engineerOverlay = resolveEffectiveAcl({
  role: "ENGINEER",
  adminAclJson: { clients: "read", catalog: "write" },
});
assert(engineerOverlay.clients === "read", "overlay clients");
assert(engineerOverlay.catalog === "write", "overlay catalog");
const sales = resolveEffectiveAcl({ role: "SALES", adminAclJson: null });
assert(sales.companies === "write", "SALES default companies");
assert(sales.clients === "write", "SALES default clients");
assert(engineer.companies === "none", "ENGINEER default companies");

const client = resolveEffectiveAcl({ role: "CLIENT", adminAclJson: { tickets: "write" } });
assert(client.tickets === "none", "non-staff ignores overlay");

console.log("test:acl — resolveEffectiveAcl OK");
