// InlineScript: <head> içine gömülecek küçük senaryoları hydration-hatasız çalıştırır.
// Resmi Next.js deseni (preventing-flash-before-hydration.md):
// - Sunucuda type="text/javascript" (çalışır), istemcide type="text/plain" (çalışmaz, çünkü script zaten sunucuda çalıştı)
// - suppressHydrationWarning: script DOM'u değiştirdiği için React'e "bu öğeyi karşılaştırma" der
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
