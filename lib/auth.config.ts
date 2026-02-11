import type { NextAuthConfig } from "next-auth";

/**
 * Shared auth config (session, callbacks). Used by both Edge and Node.
 * Edge (middleware) uses this with no adapter. Node (API/server) uses this + adapter.
 */
export const authConfig: Pick<
  NextAuthConfig,
  "session" | "pages" | "callbacks"
> = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
      }
      return session;
    },
  },
};
