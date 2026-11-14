import './globals.css';

export const metadata = {
  title: 'Virtual Try-On Kiosk - Toko Kain',
  description: 'Coba kain favorit Anda dengan AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="kiosk-mode" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div className="fixed inset-0 w-screen h-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
