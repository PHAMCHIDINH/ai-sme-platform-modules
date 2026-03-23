import type { NextAuthConfig } from "next-auth";

type SessionRole = "SME" | "STUDENT";
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

if (process.env.NODE_ENV === "production" && !authSecret) {
  throw new Error("Missing AUTH_SECRET (or NEXTAUTH_SECRET) environment variable.");
}

const authConfig: NextAuthConfig = {
  providers: [],
  secret: authSecret,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: SessionRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as SessionRole;
      }
      return session;
    },
  },
};

export default authConfig;
