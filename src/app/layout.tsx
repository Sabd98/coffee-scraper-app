import "./globals.css";
// import { initDummyUser } from "@/lib/initDummyUser";
import { AuthProvider } from "@/context/AuthContext";
import AuthLayout from "@/components/layout/AuthLayout";
import { UsersProvider } from "@/context/UsersContext";

export const metadata = {
  title: "CoffeeScraper",
  description: "Coffee Scraper Simple App",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // await initDummyUser();

  return (
    <html lang="id">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <UsersProvider>
            <AuthLayout>{children}</AuthLayout>
          </UsersProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
