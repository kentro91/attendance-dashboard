export const metadata = {
  title: "Attendance Dashboard",
  description: "Supabase Attendance Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, Arial", margin: 0 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
