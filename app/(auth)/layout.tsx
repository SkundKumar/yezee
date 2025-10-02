import '../globals.css'; // Make sure to import your global styles

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex items-center justify-center h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}