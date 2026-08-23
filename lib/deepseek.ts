// DeepSeek yapay zeka API'sine gönderilen tek ortak istek fonksiyonu.
// Hem öneri listesi hem tarif route'u bu fonksiyonu kullanır; böylece
// API çağrısı, hata yönetimi ve JSON çözümleme tek yerde toplanır.

// DeepSeek API adresi; OpenAI uyumlu olduğu için standart chat/completions ucu kullanılır
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
// Kullanılacak model; .env'de DEEPSEEK_MODEL verilmezse varsayılan deepseek-chat
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

// DeepSeek'e bir istek atar ve dönen JSON'u (ayrıştırılmış olarak) döndürür.
// - systemPrompt: modelin davranışını belirleyen kurallar
// - userPrompt: kullanıcının o anki isteği
// - maxTokens: yanıt için ayrılan üst token sınırı
export async function callDeepSeek(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1500
): Promise<unknown> {
  // API anahtarı yalnızca sunucuda tutulur; yoksa isteği hemen reddet
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("Sunucuda DEEPSEEK_API_KEY tanımlı değil.");
  }

  // DeepSeek'e POST isteği gönder
  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.9, // biraz yaratıcılık ama fazla değil
      max_tokens: maxTokens,
      response_format: { type: "json_object" }, // her zaman JSON dönmesini garanti eder
    }),
    signal: AbortSignal.timeout(55_000), // istek 55 saniyede bitmezse iptal et
  });

  // HTTP hatalarını yakala ve anlamlı bir hata üret
  if (!response.ok) {
    const errText = await response.text();
    console.error("DeepSeek hatası:", response.status, errText);
    throw new Error(`Öneri motorundan hata geldi (${response.status}).`);
  }

  // Yanıt gövdesinden mesaj içeriğini çıkar
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    throw new Error("Boş yanıt alındı");
  }

  // Model bazen ekstra metin ekleyebilir; önce düz JSON, olmazsa
  // içindeki en büyük süslü parantez bloğunu ayıklamayı dener
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("JSON ayrıştırılamadı");
  }
}
