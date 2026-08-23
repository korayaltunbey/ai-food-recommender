// Prompt kurucular ve yapay zeka yanıtlarının doğrulayıcıları.
// Bu dosya sunucu tarafında çalışır: DeepSeek'e gönderilecek
// sistem/kullanıcı promptlarını hazırlar ve gelen JSON'u sıkı şekilde kontrol eder.

import type {
  DishSuggestion,
  Recipe,
  RecipeRequest,
  SuggestionRequest,
} from "./types";

// Her istekte kaç farklı yemek önerileceği
const SUGGEST_COUNT = 5;

// ÖNERİ LİSTESİ sistemi: yapay zekadan 5 birbirinden farklı yemek adı ister.
// Çeşitlilik ve dışlama kuralları burada tanımlanır; böylece aynı türden
// yemekler, tekrar edenler ve yasaklananlar listeye giremez.
export const LIST_SYSTEM_PROMPT = `Sen deneyimli bir Türk aşçısısın. Kullanıcının isteğine göre birbirinden FARKLI ve ÇEŞİTLİ yemek önerileri listesi hazırlarsın.

Görevin her zaman SADECE geçerli bir JSON nesnesi döndürmek. Başka hiçbir şey yazma.

Döneceğin JSON şeması (küçük-büyük harflere dikkat et):
{
  "suggestions": [
    { "name": "Yemeğin adı", "type": "Ana yemek | Çorba | Zeytinyağlı | Makarna/Pilav | Börek | Salata | ...", "reason": "bu yemeği neden seçtiğin (en fazla 8 kelime)" }
  ]
}

Kurallar:
- Tüm metin Türkçe olmalı, Türkçe karakterler kullan (ş, ğ, ı, İ, ç, ö, ü).
- Tam ${SUGGEST_COUNT} farklı yemek öner.
- ÇEŞİTLİLİK ZORUNLU: Yemekler birbirinden tür ve ana malzeme olarak farklı olsun. Örneğin iki makarna, iki tavuk yemeği, iki çorba aynı listede OLMASIN. "type" alanı da birbirinden farklı olsun.
- Dışlama kurallarına kesinlikle uy: "excludeNames" listesindeki yemekleri ve ana malzemesi o listedekilerle aynı olan benzerlerini ÖNERME.
- "excludeIngredients" listesindeki ana malzemeyi içeren yemekler ÖNERME.
- Dolap modunda: verilen malzemeleri öncelikli kullan ama çeşitlilik için farklı yemekler seç; bir yemeğe en fazla 1-2 ek malzeme eklenebilir, bunu "reason"da belirtebilirsin.
- Rastgele modda: farklı mutfaklardan (Türk, İtalyan, Asya, Meksika, Akdeniz...) ve farklı türlerden seç.
- Yemekler gerçek, yapılabilir ve tanınabilir olsun; hayali isim üretme.
- "reason" kısa ve ikna edici olsun (örn. "nohut ve mercimek elinde var", "15 dakikada hazır", "hem tok tutar hem hafif").`;

// TARİF sistemi: kullanıcının seçtiği tek yemeğin tam tarifini ister.
// Ölçülerin kişi sayısına göre ölçeklenmesi ve dışlama kuralları burada emredilir.
export const RECIPE_SYSTEM_PROMPT = `Sen deneyimli bir Türk aşçısısın. Kullanıcının seçtiği yemeğin tam tarifini verirsin.

Görevin her zaman SADECE geçerli bir JSON nesnesi döndürmek. Başka hiçbir şey yazma.

Döneceğin JSON şeması (küçük-büyük harflere dikkat et):
{
  "name": "Yemeğin adı",
  "timeMinutes": toplam hazırlama ve pişirme süresi (dakika, tam sayı),
  "difficulty": "Kolay" | "Orta" | "Zor",
  "servings": kaç kişilik olduğu (tam sayı),
  "ingredients": [ { "name": "Malzeme adı", "amount": "ölçü (örn. 300 gr, 2 adet)" } ],
  "steps": [ "1. adım", "2. adım" ],
  "missingIngredients": [ "malzeme bazlı modda dolapta olmayan ama tarifte kullanılan ek malzemeler; malzeme verilmediyse boş dizi" ],
  "note": "isteğe bağlı kısa bir ipucu notu"
}

Kurallar:
- Tüm metin Türkçe olmalı, Türkçe karakterler kullan (ş, ğ, ı, İ, ç, ö, ü).
- Sadece istenen yemeğin tarifini ver; başka yemek önerme.
- Malzeme miktarları verilen kişi sayısına göre ölçeklenmiş olmalı. Ölçüler pratik ve tutarlı olsun.
- Dolap modunda: öncelikle verilen malzemeleri kullan, israf etme. Gerekirse "missingIngredients" alanında en fazla 3 tamamlayıcı malzemeyi belirt (tuz, karabiber gibi temel baharatlar hariç).
- "excludeNames" listesindeki yemekleri ve ana malzemesi o listedekilerle aynı olan benzerlerini KESİNLİKLE seçme.
- "excludeIngredients" listesindeki ana malzemeyi içeren tarif verme.
- En az 4, en fazla 12 adım olsun. Adımlar anlaşılır ve uygulanabilir olsun.
- Adımlar ölçü içermemeli, ölçüler "ingredients" listesinde yer alsın.
- Tarif gerçekten yapılabilir olsun; hayali olmayan malzeme/ölçü kullanma.`;

// Hem liste hem tarif promptuna eklenecek ortak bağlam satırlarını üretir:
// malzemeler, kişi sayısı, filtreler ve dışlama kuralları.
function buildContext(req: SuggestionRequest): string[] {
  const parts: string[] = [];

  // Dolap modunda elindeki malzemeler bildirilir
  if (req.mode === "dolap") {
    parts.push(`Dolabımda/buzdolabımda şu malzemeler var: ${req.ingredients.join(", ")}`);
  } else {
    parts.push("Malzeme kısıtım yok, istediğin yemeği önerebilirsin.");
  }

  parts.push(`Kaç kişilik: ${req.servings} kişi`);

  // İsteğe bağlı filtreler
  if (req.diet) parts.push(`Diyet tercihi: ${req.diet}`);
  if (req.maxTime) parts.push(`Toplam süre en fazla ${req.maxTime} dakika olmalı`);
  if (req.cuisine) parts.push(`Mutfak/yöre tercihi: ${req.cuisine}`);

  // Tekrar önerileri ve yasaklanan malzemeleri bildir
  if (req.excludeNames.length > 0) {
    parts.push(`excludeNames (bunları ve benzerlerini ASLA önerme): ${req.excludeNames.join(", ")}`);
  }
  if (req.excludeIngredients.length > 0) {
    parts.push(
      `excludeIngredients (bu malzemeleri içeren yemekleri ASLA önerme): ${req.excludeIngredients.join(", ")}`
    );
  }

  return parts;
}

// 5 farklı yemeklik öneri listesi için kullanıcı promptu
export function buildListUserPrompt(req: SuggestionRequest): string {
  const parts = buildContext(req);
  parts.push(
    `Tam ${SUGGEST_COUNT} farklı yemek öner. Çeşitlilik ve dışlama kurallarına uy. Sadece JSON döndür.`
  );
  return parts.join("\n");
}

// Seçilen tek yemeğin tam tarifi için kullanıcı promptu
export function buildRecipeUserPrompt(req: RecipeRequest): string {
  const parts = buildContext(req);
  parts.push(
    `Seçtiğim yemek: ${req.dishName}. Bu yemeğin tam tarifini ver; tüm ölçüleri ${req.servings} kişiye göre ölçekle. Sadece JSON döndür.`
  );
  return parts.join("\n");
}

// Tarif JSON'unun kabul edilebilir zorluk değerleri
const VALID_DIFFICULTIES: Recipe["difficulty"][] = ["Kolay", "Orta", "Zor"];

// Yapay zekanın döndüğü tarif JSON'unu doğrular ve Recipe nesnesine çevirir.
// Eksik/hatalı alan olursa hata fırlatır; böylece bozuk yanıt UI'a ulaşmaz.
export function parseRecipe(raw: unknown): Recipe {
  // Yanıt bir nesne olmalı
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Yanıt JSON bir nesne değil");
  }

  const obj = raw as Record<string, unknown>;

  // Yemek adı zorunlu
  if (typeof obj.name !== "string" || obj.name.trim().length === 0) {
    throw new Error("Tarif adı eksik");
  }

  // Zorluk seviyesi geçerli üç değerden biri olmalı
  const difficulty = obj.difficulty as Recipe["difficulty"];
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    throw new Error("Zorluk seviyesi geçersiz");
  }

  // Süre ve kişi sayısı pozitif sayılar olmalı
  const timeMinutes = Number(obj.timeMinutes);
  const servings = Number(obj.servings);
  if (!Number.isFinite(timeMinutes) || timeMinutes <= 0) {
    throw new Error("Süre bilgisi geçersiz");
  }
  if (!Number.isFinite(servings) || servings <= 0) {
    throw new Error("Kişi sayısı geçersiz");
  }

  const ingredients = Array.isArray(obj.ingredients) ? obj.ingredients : [];
  const steps = Array.isArray(obj.steps) ? obj.steps : [];

  // Malzeme listesini temizleyip normalize eder
  const parsedIngredients = ingredients.map((item) => {
    if (typeof item !== "object" || item === null) {
      return { name: "", amount: "" };
    }
    const ing = item as Record<string, unknown>;
    return {
      name: typeof ing.name === "string" ? ing.name.trim() : "",
      amount: typeof ing.amount === "string" ? ing.amount.trim() : "",
    };
  });

  // Boş adımları temizler
  const parsedSteps = steps
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter((s) => s.length > 0);

  // Anlamsız tarifleri eler
  if (parsedIngredients.length === 0) {
    throw new Error("Malzeme listesi boş");
  }
  if (parsedSteps.length === 0) {
    throw new Error("Tarif adımları boş");
  }

  // Eksik olabilecek malzemeler (dolap modu) - boşları temizle
  const missingIngredients = Array.isArray(obj.missingIngredients)
    ? obj.missingIngredients
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter((s) => s.length > 0)
    : [];

  return {
    name: obj.name.trim(),
    timeMinutes,
    difficulty,
    servings,
    ingredients: parsedIngredients,
    steps: parsedSteps,
    missingIngredients,
    note: typeof obj.note === "string" ? obj.note.trim() : undefined,
  };
}

// Öneri listesi JSON'unu doğrular ve en fazla SUGGEST_COUNT adet yemek döndürür.
// Geçersiz/boş isimli maddeleri ayıklar; hiç geçerli madde kalmazsa hata verir.
export function parseSuggestionList(raw: unknown): DishSuggestion[] {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Yanıt JSON bir nesne değil");
  }

  const obj = raw as Record<string, unknown>;
  const list = Array.isArray(obj.suggestions) ? obj.suggestions : [];
  if (list.length === 0) {
    throw new Error("Öneri listesi boş");
  }

  const suggestions = list
    .map((item): DishSuggestion | null => {
      if (typeof item !== "object" || item === null) return null;
      const s = item as Record<string, unknown>;
      if (typeof s.name !== "string" || s.name.trim().length === 0) return null;
      return {
        name: s.name.trim(),
        type: typeof s.type === "string" ? s.type.trim() : "",
        reason: typeof s.reason === "string" ? s.reason.trim() : "",
      };
    })
    .filter((s): s is DishSuggestion => s !== null);

  if (suggestions.length === 0) {
    throw new Error("Geçerli öneri bulunamadı");
  }

  return suggestions.slice(0, SUGGEST_COUNT);
}

// Diğer modüllerin (API route'ları) öneri adedine erişebilmesi için dışa açılır
export { SUGGEST_COUNT };
