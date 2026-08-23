// Kök seviye hata sınırı: layout bileşeni dahil herhangi bir yerde
// yakalanmamış hata olursa burası devreye girer.
// Kendi <html>/<body> etiketlerini içermesi ZORUNLUDUR (global-error kuralı).

"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body style={{ margin: 0, fontFamily: "ui-monospace, monospace" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: 24,
            textAlign: "center",
            background: "#0c0a09",
            color: "#e7e5e4",
          }}
        >
          <div style={{ fontSize: 48 }}>😕</div>
          <h1 style={{ fontSize: 22, margin: 0 }}>Beklenmeyen bir hata oluştu</h1>
          <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>
            Tekrar denemek için butona tıkla.
          </p>
          {process.env.NODE_ENV === "development" && (
            <p
              style={{
                maxWidth: 480,
                wordBreak: "break-word",
                fontSize: 12,
                color: "#fca5a5",
                border: "1px solid #292524",
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              {error.message || "Bilinmeyen hata"}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: 8,
              padding: "10px 20px",
              border: "none",
              borderRadius: 8,
              background: "#ea580c",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Tekrar Dene
          </button>
        </main>
      </body>
    </html>
  );
}
