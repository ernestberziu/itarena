import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { Role } from "@/types/domain";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // JWT + credentials only — no OAuth accounts. PrismaAdapter is omitted
  // because it can interfere with Credentials sign-in in Auth.js v5.
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: {
    signIn: "/hyr",
    error: "/hyr",
  },
  // Suppress JWTSessionError noise from stale/rotated cookies — treat as unauthenticated.
  logger: {
    error(error) {
      const t = (error as { type?: string }).type;
      if (t === "JWTSessionError") return;
      // Wrong password / unknown user — authorize returned null; not a server bug.
      if (t === "CredentialsSignin") return;
      console.error("[auth]", error);
    },
    warn(code) {
      console.warn("[auth]", code);
    },
    debug() {},
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Fjalëkalimi", type: "password" },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      authorize: async (credentials: any) => {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();

        let user;
        try {
          user = await db.user.findUnique({
            where: { email },
            include: { company: true },
          });
        } catch (err) {
          console.error("[auth] Database error during sign-in (check DATABASE_URL):", err);
          return null;
        }

        if (!user || !user.passwordHash) return null;
        if (!user.isActive) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        try {
          await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
        } catch {
          /* non-fatal */
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role as Role,
          companyId: user.companyId,
          language: user.language,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;
        token.id = u.id;
        token.sub = u.id;
        token.role = u.role;
        token.companyId = u.companyId;
        token.language = u.language ?? "sq";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = session as any;
        s.user.id = token.id as string;
        s.user.role = token.role as Role;
        s.user.companyId = token.companyId as string | null;
        s.user.language = (token.language as string) ?? "sq";
      }
      return session;
    },
  },
});
