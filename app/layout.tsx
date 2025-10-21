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
      <body>{process.env.NEXT_PUBLIC_APP_PROCTED=="true" ? <p>App is running and working</p> : children }</body>
    </html>
  );
}
