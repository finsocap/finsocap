import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        return {
          id: "1",
          name: credentials.email.split("@")[0],
          email: credentials.email,
          role: "ADMIN",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = (user as any).role || "ADMIN";
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.role = token.role || "ADMIN";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "finsocap_production_super_secret_jwt_auth_key_2026",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

