import type { Role } from "@/types/domain";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    companyId: string | null;
    language: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: Role;
      companyId: string | null;
      language: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    companyId: string | null;
    language: string;
  }
}
