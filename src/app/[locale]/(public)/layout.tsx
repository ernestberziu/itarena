import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthSessionProvider>
  );
}
