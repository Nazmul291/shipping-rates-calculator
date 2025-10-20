export const metadata = {
  title: 'Carrier Service',
  description: 'Shopify Carrier Service',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
