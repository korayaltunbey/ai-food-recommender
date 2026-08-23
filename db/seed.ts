import { eq } from "drizzle-orm";

import { db } from "../lib/db";
import {
  ingredients,
  recipeDiets,
  recipeIngredients,
  recipeSteps,
  recipes,
} from "./schema";

type SeedIngredient = {
  name: string;
  quantity: number | null;
  unit: string;
  quantityText?: string;
  preparation?: string;
  optional?: boolean;
};

type SeedRecipe = {
  slug: string;
  name: string;
  category: string;
  timeMinutes: number;
  difficulty: "Kolay" | "Orta" | "Zor";
  baseServings: number;
  note?: string;
  diets: string[];
  ingredients: SeedIngredient[];
  steps: string[];
};

const CUISINE = "Türk Mutfağı";

// Ingredient names are canonicalized before insertion so all recipes share
// the same ingredient row even when Turkish casing/diacritics are involved.
function normalizeIngredientName(name: string): string {
  return name
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/İ/g, "i")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function ingredient(
  name: string,
  quantity: number | null,
  unit: string,
  options: Omit<SeedIngredient, "name" | "quantity" | "unit"> = {}
): SeedIngredient {
  return { name, quantity, unit, ...options };
}

const seedRecipes: SeedRecipe[] = [
  {
    slug: "menemen",
    name: "Menemen",
    category: "Kahvaltı",
    timeMinutes: 20,
    difficulty: "Kolay",
    baseServings: 2,
    note: "Yumurtaları fazla kurutmadan ocaktan almak menemenin kıvamını korur.",
    diets: ["vegetarian", "gluten_free"],
    ingredients: [
      ingredient("Yumurta", 4, "adet"),
      ingredient("Domates", 3, "adet", { preparation: "küçük doğranmış" }),
      ingredient("Yeşil biber", 2, "adet", { preparation: "ince doğranmış" }),
      ingredient("Soğan", 1, "adet", { preparation: "ince doğranmış", optional: true }),
      ingredient("Zeytinyağı", 2, "yemek kaşığı"),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
      ingredient("Karabiber", null, "tutam", { quantityText: "isteğe göre" }),
    ],
    steps: [
      "Zeytinyağını tavada ısıtıp soğanı ve biberi yumuşayana kadar kavur.",
      "Domatesleri ekleyip suyunu çekene kadar pişir.",
      "Tuz ve karabiberi ekle.",
      "Yumurtaları kırıp hafifçe karıştırarak istediğin kıvama gelene kadar pişir.",
    ],
  },
  {
    slug: "sucuklu-yumurta",
    name: "Sucuklu Yumurta",
    category: "Kahvaltı",
    timeMinutes: 15,
    difficulty: "Kolay",
    baseServings: 2,
    diets: ["gluten_free"],
    ingredients: [
      ingredient("Sucuk", 120, "gram", { preparation: "ince dilimlenmiş" }),
      ingredient("Yumurta", 4, "adet"),
      ingredient("Tereyağı", 1, "yemek kaşığı"),
      ingredient("Tuz", null, "tutam", { quantityText: "isteğe göre" }),
    ],
    steps: [
      "Tereyağını tavada erit.",
      "Sucuk dilimlerini ekleyip iki tarafını kısa süre kızart.",
      "Yumurtaları sucukların üzerine kır.",
      "Yumurtaların beyazı pişene kadar tavayı kısık ateşte tut ve servis et.",
    ],
  },
  {
    slug: "kuymak-muhlama",
    name: "Kuymak (Muhlama)",
    category: "Kahvaltı",
    timeMinutes: 20,
    difficulty: "Kolay",
    baseServings: 2,
    diets: ["vegetarian", "gluten_free"],
    ingredients: [
      ingredient("Tereyağı", 2, "yemek kaşığı"),
      ingredient("Mısır unu", 3, "yemek kaşığı"),
      ingredient("Su", 1.5, "su bardağı"),
      ingredient("Kolot peyniri", 200, "gram", { preparation: "rendelenmiş" }),
      ingredient("Tuz", null, "tutam", { quantityText: "isteğe göre" }),
    ],
    steps: [
      "Tereyağını tavada eritip mısır ununu ekle.",
      "Mısır ununu kokusu çıkana kadar birkaç dakika kavur.",
      "Suyu yavaşça ekleyip topaklanmaması için karıştır.",
      "Peynir ve tuzu ekleyip peynir eriyene ve yağ yüzeye çıkana kadar pişir.",
    ],
  },
  {
    slug: "pisi",
    name: "Pişi",
    category: "Kahvaltı",
    timeMinutes: 45,
    difficulty: "Orta",
    baseServings: 4,
    diets: ["vegetarian"],
    ingredients: [
      ingredient("Un", 4, "su bardağı"),
      ingredient("Su", 1.5, "su bardağı", { preparation: "ılık" }),
      ingredient("Kuru maya", 1, "tatlı kaşığı"),
      ingredient("Tuz", 1, "çay kaşığı"),
      ingredient("Toz şeker", 1, "çay kaşığı"),
      ingredient("Sıvı yağ", 500, "ml", { preparation: "kızartmak için" }),
    ],
    steps: [
      "Ilık su, maya ve şekeri karıştırıp birkaç dakika beklet.",
      "Un ve tuzu ekleyerek yumuşak bir hamur yoğur.",
      "Hamurun üzerini kapatıp yaklaşık 30 dakika mayalandır.",
      "Hamurdan parçalar koparıp aç ve ortalarını hafifçe del.",
      "Sıvı yağı kızdırıp pişileri iki tarafı altın rengini alana kadar kızart.",
    ],
  },
  {
    slug: "mercimek-corbasi",
    name: "Mercimek Çorbası",
    category: "Çorba",
    timeMinutes: 40,
    difficulty: "Kolay",
    baseServings: 4,
    diets: ["vegan", "vegetarian", "gluten_free", "low_calorie"],
    ingredients: [
      ingredient("Kırmızı mercimek", 1, "su bardağı"),
      ingredient("Soğan", 1, "adet", { preparation: "doğranmış" }),
      ingredient("Havuç", 1, "adet", { preparation: "doğranmış" }),
      ingredient("Patates", 1, "adet", { preparation: "küçük doğranmış" }),
      ingredient("Zeytinyağı", 2, "yemek kaşığı"),
      ingredient("Su", 6, "su bardağı"),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
      ingredient("Karabiber", null, "tutam", { quantityText: "isteğe göre" }),
      ingredient("Kimyon", 1, "çay kaşığı", { optional: true }),
    ],
    steps: [
      "Mercimeği bol suyla yıka.",
      "Zeytinyağında soğan, havuç ve patatesi birkaç dakika kavur.",
      "Mercimek, su, tuz ve karabiberi ekleyip sebzeler yumuşayana kadar pişir.",
      "Çorbayı blenderdan geçirip kimyonu ekle ve birkaç dakika daha kaynat.",
    ],
  },
  {
    slug: "ezogelin-corbasi",
    name: "Ezogelin Çorbası",
    category: "Çorba",
    timeMinutes: 50,
    difficulty: "Orta",
    baseServings: 4,
    diets: ["vegan", "vegetarian"],
    ingredients: [
      ingredient("Kırmızı mercimek", 1, "su bardağı"),
      ingredient("İnce bulgur", 2, "yemek kaşığı"),
      ingredient("Pirinç", 2, "yemek kaşığı"),
      ingredient("Soğan", 1, "adet", { preparation: "ince doğranmış" }),
      ingredient("Domates salçası", 1, "yemek kaşığı"),
      ingredient("Biber salçası", 1, "tatlı kaşığı", { optional: true }),
      ingredient("Zeytinyağı", 2, "yemek kaşığı"),
      ingredient("Nane", 1, "tatlı kaşığı"),
      ingredient("Pul biber", 1, "çay kaşığı", { optional: true }),
      ingredient("Su", 7, "su bardağı"),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
    ],
    steps: [
      "Mercimek, pirinç ve bulguru yıkayıp tencereye al.",
      "Suyu ekleyip bakliyatlar yumuşayana kadar kaynat.",
      "Ayrı tavada zeytinyağı, soğan, salçalar, nane ve pul biberi kavur.",
      "Salçalı karışımı çorbaya ekleyip tuzunu ayarla ve 10 dakika daha kaynat.",
    ],
  },
  {
    slug: "yayla-corbasi",
    name: "Yayla Çorbası",
    category: "Çorba",
    timeMinutes: 40,
    difficulty: "Orta",
    baseServings: 4,
    diets: ["vegetarian", "gluten_free"],
    ingredients: [
      ingredient("Yoğurt", 1, "su bardağı"),
      ingredient("Pirinç", 3, "yemek kaşığı"),
      ingredient("Yumurta", 1, "adet"),
      ingredient("Un", 1, "yemek kaşığı"),
      ingredient("Su", 6, "su bardağı"),
      ingredient("Tereyağı", 1, "yemek kaşığı"),
      ingredient("Kuru nane", 1, "tatlı kaşığı"),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
    ],
    steps: [
      "Pirinci suyla tencereye alıp yumuşayana kadar haşla.",
      "Yoğurt, yumurta ve unu ayrı bir kapta çırp.",
      "Çorbanın sıcak suyundan yoğurtlu karışıma azar azar ekleyerek ılıt.",
      "Karışımı tencereye döküp sürekli karıştırarak kaynama noktasına getir.",
      "Tereyağında naneyi yakmadan kızdırıp çorbanın üzerine dök.",
    ],
  },
  {
    slug: "tarhana-corbasi",
    name: "Tarhana Çorbası",
    category: "Çorba",
    timeMinutes: 30,
    difficulty: "Kolay",
    baseServings: 4,
    diets: ["vegetarian"],
    ingredients: [
      ingredient("Tarhana", 5, "yemek kaşığı"),
      ingredient("Domates salçası", 1, "yemek kaşığı"),
      ingredient("Tereyağı", 1, "yemek kaşığı"),
      ingredient("Su", 6, "su bardağı"),
      ingredient("Sarımsak", 1, "diş", { preparation: "ezilmiş", optional: true }),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
      ingredient("Kuru nane", 1, "çay kaşığı", { optional: true }),
    ],
    steps: [
      "Tarhanayı bir su bardağı suyla pürüzsüz olana kadar karıştırıp beklet.",
      "Tereyağında salçayı ve sarımsağı kısa süre kavur.",
      "Kalan suyu ve açılmış tarhanayı tencereye ekleyip sürekli karıştır.",
      "Çorba koyulaşıp kaynayınca tuz ve naneyi ekleyerek birkaç dakika pişir.",
    ],
  },
  {
    slug: "karniyarik",
    name: "Karnıyarık",
    category: "Ana yemek",
    timeMinutes: 75,
    difficulty: "Orta",
    baseServings: 4,
    diets: ["gluten_free"],
    ingredients: [
      ingredient("Patlıcan", 4, "adet"),
      ingredient("Kıyma", 300, "gram"),
      ingredient("Soğan", 1, "adet", { preparation: "doğranmış" }),
      ingredient("Domates", 2, "adet", { preparation: "doğranmış" }),
      ingredient("Yeşil biber", 2, "adet", { preparation: "doğranmış" }),
      ingredient("Sarımsak", 2, "diş", { preparation: "doğranmış" }),
      ingredient("Domates salçası", 1, "yemek kaşığı"),
      ingredient("Sıvı yağ", 4, "yemek kaşığı"),
      ingredient("Su", 1, "su bardağı"),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
      ingredient("Karabiber", null, "tutam", { quantityText: "isteğe göre" }),
    ],
    steps: [
      "Patlıcanları alacalı soyup tuzlu suda beklet ve kurula.",
      "Patlıcanları az yağda yumuşayana kadar çevirerek kızart.",
      "Ayrı tavada soğan, sarımsak, biber ve kıymayı kavur.",
      "Domates, salça, tuz ve karabiberi ekleyip harcı birkaç dakika pişir.",
      "Patlıcanların ortasını açıp harçla doldur, tepsiye diz ve suyu ekle.",
      "200 derece fırında yaklaşık 25 dakika pişir.",
    ],
  },
  {
    slug: "imam-bayildi",
    name: "İmam Bayıldı",
    category: "Ana yemek",
    timeMinutes: 70,
    difficulty: "Orta",
    baseServings: 4,
    diets: ["vegan", "vegetarian", "gluten_free", "low_calorie"],
    ingredients: [
      ingredient("Patlıcan", 4, "adet"),
      ingredient("Soğan", 3, "adet", { preparation: "piyazlık doğranmış" }),
      ingredient("Domates", 3, "adet", { preparation: "doğranmış" }),
      ingredient("Sarımsak", 4, "diş", { preparation: "doğranmış" }),
      ingredient("Yeşil biber", 2, "adet", { preparation: "doğranmış", optional: true }),
      ingredient("Zeytinyağı", 6, "yemek kaşığı"),
      ingredient("Toz şeker", 1, "çay kaşığı", { optional: true }),
      ingredient("Su", 1, "su bardağı"),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
    ],
    steps: [
      "Patlıcanları alacalı soyup ortalarına uzun bir çizik at.",
      "Patlıcanları zeytinyağının bir kısmıyla tavada veya fırında yumuşat.",
      "Kalan yağda soğan, sarımsak ve biberi kavur.",
      "Domates, şeker ve tuzu ekleyip soğanlar iyice yumuşayana kadar pişir.",
      "Patlıcanları tepsiye alıp içlerini aç ve soğanlı harçla doldur.",
      "Suyu ekleyip 190 derece fırında yaklaşık 30 dakika pişir.",
    ],
  },
  {
    slug: "kuru-fasulye",
    name: "Kuru Fasulye",
    category: "Ana yemek",
    timeMinutes: 90,
    difficulty: "Orta",
    baseServings: 4,
    diets: ["vegan", "vegetarian", "gluten_free", "low_calorie"],
    ingredients: [
      ingredient("Kuru fasulye", 2, "su bardağı"),
      ingredient("Soğan", 1, "adet", { preparation: "doğranmış" }),
      ingredient("Domates salçası", 1, "yemek kaşığı"),
      ingredient("Biber salçası", 1, "yemek kaşığı", { optional: true }),
      ingredient("Zeytinyağı", 3, "yemek kaşığı"),
      ingredient("Su", 6, "su bardağı"),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
      ingredient("Karabiber", null, "tutam", { quantityText: "isteğe göre" }),
    ],
    steps: [
      "Kuru fasulyeyi bir gece önceden bol suyla ıslat.",
      "Fasulyeyi süzüp yeni suyla yumuşayana kadar haşla.",
      "Zeytinyağında soğanı kavurup salçaları ekle.",
      "Fasulyeyi ve suyu tencereye alıp kısık ateşte sos koyulaşana kadar pişir.",
      "Tuz ve karabiberi pişmenin sonlarına doğru ekle.",
    ],
  },
  {
    slug: "manti",
    name: "Mantı",
    category: "Ana yemek",
    timeMinutes: 100,
    difficulty: "Zor",
    baseServings: 4,
    diets: [],
    ingredients: [
      ingredient("Un", 3, "su bardağı"),
      ingredient("Yumurta", 1, "adet"),
      ingredient("Su", 1, "su bardağı"),
      ingredient("Kıyma", 250, "gram"),
      ingredient("Soğan", 1, "adet", { preparation: "rendelenmiş" }),
      ingredient("Yoğurt", 2, "su bardağı"),
      ingredient("Sarımsak", 2, "diş", { preparation: "ezilmiş" }),
      ingredient("Tereyağı", 2, "yemek kaşığı"),
      ingredient("Domates salçası", 1, "yemek kaşığı"),
      ingredient("Pul biber", 1, "çay kaşığı", { optional: true }),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
      ingredient("Karabiber", null, "tutam", { quantityText: "isteğe göre" }),
    ],
    steps: [
      "Un, yumurta, su ve tuzla sert bir hamur yoğurup dinlendir.",
      "Kıyma, soğan, tuz ve karabiberi karıştırarak iç harcı hazırla.",
      "Hamuru ince açıp küçük kareler kes ve her karenin ortasına harç koy.",
      "Karelerin köşelerini birleştirerek mantıları kapat.",
      "Mantıları kaynayan tuzlu suda hamur yumuşayana kadar haşla.",
      "Sarımsaklı yoğurdu hazırla; tereyağında salça ve pul biberi kızdır.",
      "Mantıyı yoğurt ve salçalı sosla servis et.",
    ],
  },
  {
    slug: "izmir-kofte",
    name: "İzmir Köfte",
    category: "Ana yemek",
    timeMinutes: 70,
    difficulty: "Orta",
    baseServings: 4,
    diets: [],
    ingredients: [
      ingredient("Kıyma", 500, "gram"),
      ingredient("Soğan", 1, "adet", { preparation: "rendelenmiş" }),
      ingredient("Bayat ekmek içi", 1, "su bardağı"),
      ingredient("Yumurta", 1, "adet"),
      ingredient("Patates", 4, "adet", { preparation: "elma dilimi doğranmış" }),
      ingredient("Domates", 3, "adet", { preparation: "doğranmış" }),
      ingredient("Yeşil biber", 3, "adet"),
      ingredient("Domates salçası", 1, "yemek kaşığı"),
      ingredient("Sıvı yağ", 4, "yemek kaşığı"),
      ingredient("Su", 2, "su bardağı"),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
      ingredient("Karabiber", null, "tutam", { quantityText: "isteğe göre" }),
    ],
    steps: [
      "Kıyma, soğan, ekmek içi, yumurta, tuz ve karabiberi yoğur.",
      "Harçtan parmak köfteler şekillendir.",
      "Köfteleri ve patatesleri az yağda hafifçe kızart.",
      "Tepsiye köfte, patates, domates ve biberleri diz.",
      "Salçayı suyla açıp tepsiye dök.",
      "200 derece fırında patatesler yumuşayana kadar pişir.",
    ],
  },
  {
    slug: "hunkar-begendi",
    name: "Hünkar Beğendi",
    category: "Ana yemek",
    timeMinutes: 100,
    difficulty: "Zor",
    baseServings: 4,
    diets: [],
    ingredients: [
      ingredient("Kuzu kuşbaşı", 600, "gram"),
      ingredient("Soğan", 1, "adet", { preparation: "doğranmış" }),
      ingredient("Domates", 2, "adet", { preparation: "doğranmış" }),
      ingredient("Domates salçası", 1, "yemek kaşığı"),
      ingredient("Patlıcan", 4, "adet"),
      ingredient("Tereyağı", 2, "yemek kaşığı"),
      ingredient("Un", 2, "yemek kaşığı"),
      ingredient("Süt", 2, "su bardağı"),
      ingredient("Kaşar peyniri", 100, "gram", { preparation: "rendelenmiş" }),
      ingredient("Su", 2, "su bardağı"),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
      ingredient("Karabiber", null, "tutam", { quantityText: "isteğe göre" }),
    ],
    steps: [
      "Patlıcanları közleyip kabuklarını soy ve içlerini ince kıy.",
      "Kuzu etini tencerede suyunu salıp çekene kadar pişir.",
      "Soğanı, salçayı ve domatesi ekleyip kavur; suyu ilave ederek et yumuşayana kadar pişir.",
      "Beğendi için tereyağında unu kavurup sütü yavaşça ekle.",
      "Közlenmiş patlıcan ve kaşar peynirini beşamele karıştırıp tuzunu ayarla.",
      "Beğendiyi tabağa alıp üzerine kuzu etini yerleştir.",
    ],
  },
  {
    slug: "su-boregi",
    name: "Su Böreği",
    category: "Hamur işi",
    timeMinutes: 120,
    difficulty: "Zor",
    baseServings: 8,
    diets: ["vegetarian"],
    ingredients: [
      ingredient("Un", 6, "su bardağı"),
      ingredient("Yumurta", 6, "adet"),
      ingredient("Su", 1, "su bardağı"),
      ingredient("Beyaz peynir", 400, "gram", { preparation: "ezilmiş" }),
      ingredient("Maydanoz", 1, "demet", { preparation: "doğranmış", optional: true }),
      ingredient("Tereyağı", 200, "gram", { preparation: "eritilmiş" }),
      ingredient("Tuz", 2, "çay kaşığı"),
    ],
    steps: [
      "Un, yumurta, su ve tuzla sert bir hamur yoğurup bezelere ayır.",
      "Bezeleri ince yufkalar halinde aç.",
      "Yufkaları kaynar tuzlu suda kısa süre haşlayıp soğuk suya al.",
      "Tepsiyi yağlayıp ilk yufkayı kuru ser; diğer yufkaları eritilmiş tereyağıyla kat kat yerleştir.",
      "Orta kata peynir ve maydanoz serpiştir.",
      "Kalan yufkaları yerleştirip üzerine tereyağı sür.",
      "180 derece fırında üzeri kızarana kadar pişir.",
    ],
  },
  {
    slug: "patatesli-gozleme",
    name: "Patatesli Gözleme",
    category: "Hamur işi",
    timeMinutes: 60,
    difficulty: "Orta",
    baseServings: 4,
    diets: ["vegan", "vegetarian"],
    ingredients: [
      ingredient("Un", 4, "su bardağı"),
      ingredient("Su", 1.5, "su bardağı"),
      ingredient("Tuz", 1, "çay kaşığı"),
      ingredient("Patates", 4, "adet"),
      ingredient("Soğan", 1, "adet", { preparation: "doğranmış" }),
      ingredient("Zeytinyağı", 3, "yemek kaşığı"),
      ingredient("Pul biber", 1, "çay kaşığı", { optional: true }),
      ingredient("Karabiber", null, "tutam", { quantityText: "isteğe göre" }),
    ],
    steps: [
      "Un, su ve tuzla yumuşak bir hamur yoğurup dinlendir.",
      "Patatesleri haşlayıp ez.",
      "Zeytinyağında soğanı kavurup patates, pul biber ve karabiberle karıştır.",
      "Hamuru bezelere ayırıp ince aç ve yarısına iç harcı yay.",
      "Hamuru kapatıp kenarlarını bastır.",
      "Gözlemeleri yağsız tavada iki tarafı kızarana kadar pişir.",
    ],
  },
  {
    slug: "lahmacun",
    name: "Lahmacun",
    category: "Hamur işi",
    timeMinutes: 75,
    difficulty: "Zor",
    baseServings: 6,
    diets: [],
    ingredients: [
      ingredient("Un", 4, "su bardağı"),
      ingredient("Su", 1.5, "su bardağı"),
      ingredient("Kıyma", 400, "gram"),
      ingredient("Soğan", 2, "adet", { preparation: "doğranmış" }),
      ingredient("Domates", 2, "adet", { preparation: "doğranmış" }),
      ingredient("Kırmızı biber", 2, "adet", { preparation: "doğranmış" }),
      ingredient("Maydanoz", 1, "demet", { preparation: "doğranmış" }),
      ingredient("Domates salçası", 1, "yemek kaşığı"),
      ingredient("Biber salçası", 1, "yemek kaşığı"),
      ingredient("Sıvı yağ", 2, "yemek kaşığı"),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
      ingredient("Pul biber", 1, "çay kaşığı", { optional: true }),
    ],
    steps: [
      "Un, su ve tuzla yumuşak bir hamur yoğurup dinlendir.",
      "Kıyma, sebzeler, maydanoz, salçalar, yağ ve baharatları ince bir harç olana kadar karıştır.",
      "Hamuru bezelere ayırıp çok ince aç.",
      "Kıymalı harcı hamurların üzerine ince bir tabaka halinde yay.",
      "Lahmacunları 250 derece fırında kenarları kızarana kadar pişir.",
    ],
  },
  {
    slug: "kiymali-pide",
    name: "Kıymalı Pide",
    category: "Hamur işi",
    timeMinutes: 75,
    difficulty: "Orta",
    baseServings: 4,
    diets: [],
    ingredients: [
      ingredient("Un", 4, "su bardağı"),
      ingredient("Su", 1.5, "su bardağı"),
      ingredient("Kuru maya", 1, "tatlı kaşığı"),
      ingredient("Kıyma", 400, "gram"),
      ingredient("Soğan", 2, "adet", { preparation: "ince doğranmış" }),
      ingredient("Domates", 2, "adet", { preparation: "küçük doğranmış" }),
      ingredient("Yeşil biber", 2, "adet", { preparation: "doğranmış" }),
      ingredient("Domates salçası", 1, "yemek kaşığı"),
      ingredient("Sıvı yağ", 2, "yemek kaşığı"),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
      ingredient("Karabiber", null, "tutam", { quantityText: "isteğe göre" }),
    ],
    steps: [
      "Un, su, maya ve tuzla yumuşak bir hamur yoğurup mayalandır.",
      "Kıyma, soğan, domates, biber, salça ve baharatları karıştır.",
      "Hamuru dört bezeye ayırıp uzun oval şekilde aç.",
      "Kıymalı harcı hamurun ortasına yay ve kenarlarını içe doğru kıvır.",
      "250 derece fırında pide kenarları kızarana kadar pişir.",
    ],
  },
  {
    slug: "coban-salatasi",
    name: "Çoban Salatası",
    category: "Salata/meze",
    timeMinutes: 15,
    difficulty: "Kolay",
    baseServings: 4,
    diets: ["vegan", "vegetarian", "gluten_free", "low_calorie"],
    ingredients: [
      ingredient("Domates", 4, "adet", { preparation: "küçük doğranmış" }),
      ingredient("Salatalık", 2, "adet", { preparation: "küçük doğranmış" }),
      ingredient("Yeşil biber", 2, "adet", { preparation: "doğranmış" }),
      ingredient("Soğan", 1, "adet", { preparation: "ince doğranmış" }),
      ingredient("Maydanoz", 1, "demet", { preparation: "doğranmış" }),
      ingredient("Zeytinyağı", 4, "yemek kaşığı"),
      ingredient("Limon suyu", 2, "yemek kaşığı"),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
    ],
    steps: [
      "Domates, salatalık, biber ve soğanı küçük doğrayıp kaseye al.",
      "Maydanozu ekleyip sebzeleri karıştır.",
      "Zeytinyağı, limon suyu ve tuzu ayrı kapta çırp.",
      "Sosu salatanın üzerine döküp servis et.",
    ],
  },
  {
    slug: "kisir",
    name: "Kısır",
    category: "Salata/meze",
    timeMinutes: 35,
    difficulty: "Kolay",
    baseServings: 6,
    diets: ["vegan", "vegetarian"],
    ingredients: [
      ingredient("İnce bulgur", 2, "su bardağı"),
      ingredient("Su", 2, "su bardağı", { preparation: "sıcak" }),
      ingredient("Domates salçası", 2, "yemek kaşığı"),
      ingredient("Biber salçası", 1, "yemek kaşığı"),
      ingredient("Soğan", 1, "adet", { preparation: "ince doğranmış" }),
      ingredient("Maydanoz", 1, "demet", { preparation: "doğranmış" }),
      ingredient("Taze soğan", 4, "adet", { preparation: "doğranmış" }),
      ingredient("Zeytinyağı", 5, "yemek kaşığı"),
      ingredient("Limon suyu", 3, "yemek kaşığı"),
      ingredient("Nar ekşisi", 2, "yemek kaşığı", { optional: true }),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
      ingredient("Pul biber", 1, "çay kaşığı", { optional: true }),
    ],
    steps: [
      "İnce bulguru sıcak suyla ıslatıp üzerini kapat ve 15 dakika beklet.",
      "Soğanı zeytinyağında yumuşatıp salçaları ekleyerek kavur.",
      "Salçalı karışımı bulgura ekleyip iyice yoğur.",
      "Maydanoz, taze soğan, limon suyu, nar ekşisi ve baharatları karıştır.",
      "Kısırı dinlendirip marul yapraklarıyla servis et.",
    ],
  },
  {
    slug: "haydari",
    name: "Haydari",
    category: "Salata/meze",
    timeMinutes: 20,
    difficulty: "Kolay",
    baseServings: 4,
    diets: ["vegetarian", "gluten_free", "low_carb"],
    ingredients: [
      ingredient("Süzme yoğurt", 2, "su bardağı"),
      ingredient("Beyaz peynir", 100, "gram", { preparation: "ezilmiş" }),
      ingredient("Sarımsak", 2, "diş", { preparation: "ezilmiş" }),
      ingredient("Tereyağı", 1, "yemek kaşığı"),
      ingredient("Kuru nane", 1, "tatlı kaşığı"),
      ingredient("Dereotu", 2, "yemek kaşığı", { preparation: "doğranmış", optional: true }),
      ingredient("Tuz", null, "tutam", { quantityText: "isteğe göre" }),
    ],
    steps: [
      "Tereyağında kuru naneyi kısa süre kızdırıp soğumaya bırak.",
      "Süzme yoğurt, beyaz peynir ve sarımsağı karıştır.",
      "Naneli tereyağı, dereotu ve tuzu ekleyip pürüzsüz olana kadar karıştır.",
      "Haydarinin üzerini düzeltip soğuk servis et.",
    ],
  },
  {
    slug: "patlican-salatasi",
    name: "Patlıcan Salatası",
    category: "Salata/meze",
    timeMinutes: 35,
    difficulty: "Kolay",
    baseServings: 4,
    diets: ["vegan", "vegetarian", "gluten_free", "low_calorie"],
    ingredients: [
      ingredient("Patlıcan", 4, "adet"),
      ingredient("Kırmızı biber", 2, "adet", { optional: true }),
      ingredient("Sarımsak", 2, "diş", { preparation: "ezilmiş" }),
      ingredient("Zeytinyağı", 4, "yemek kaşığı"),
      ingredient("Limon suyu", 2, "yemek kaşığı"),
      ingredient("Maydanoz", 0.5, "demet", { preparation: "doğranmış", optional: true }),
      ingredient("Tuz", null, "tutam", { quantityText: "yeteri kadar" }),
    ],
    steps: [
      "Patlıcan ve biberleri közleyip kabuklarını soy.",
      "Közlenmiş sebzeleri bıçakla ince kıy.",
      "Sarımsak, zeytinyağı, limon suyu ve tuzla karıştır.",
      "Maydanozla süsleyip soğuk servis et.",
    ],
  },
  {
    slug: "baklava",
    name: "Baklava",
    category: "Tatlı",
    timeMinutes: 120,
    difficulty: "Zor",
    baseServings: 12,
    diets: ["vegetarian"],
    ingredients: [
      ingredient("Baklavalık yufka", 1, "paket"),
      ingredient("Ceviz içi", 300, "gram", { preparation: "iri çekilmiş" }),
      ingredient("Tereyağı", 250, "gram", { preparation: "eritilmiş" }),
      ingredient("Toz şeker", 3, "su bardağı"),
      ingredient("Su", 3, "su bardağı"),
      ingredient("Limon suyu", 1, "tatlı kaşığı"),
    ],
    steps: [
      "Su ve şekeri kaynatıp limon suyunu ekleyerek şerbeti hazırla ve soğut.",
      "Tepsiyi yağlayıp yufkaların yarısını aralarına tereyağı sürerek diz.",
      "Cevizi tepsiye eşit şekilde yay.",
      "Kalan yufkaları da tereyağıyla kat kat yerleştirip baklavayı dilimle.",
      "180 derece fırında üzeri kızarana kadar pişir.",
      "Sıcak baklavaya soğuk şerbeti döküp dinlendir.",
    ],
  },
  {
    slug: "sutlac",
    name: "Sütlaç",
    category: "Tatlı",
    timeMinutes: 55,
    difficulty: "Kolay",
    baseServings: 6,
    diets: ["vegetarian", "gluten_free"],
    ingredients: [
      ingredient("Süt", 1, "litre"),
      ingredient("Pirinç", 1, "çay bardağı"),
      ingredient("Su", 2, "su bardağı"),
      ingredient("Toz şeker", 1, "su bardağı"),
      ingredient("Mısır nişastası", 1, "yemek kaşığı", { optional: true }),
      ingredient("Vanilin", 1, "paket", { optional: true }),
      ingredient("Tarçın", null, "tutam", { quantityText: "servis için, isteğe göre", optional: true }),
    ],
    steps: [
      "Pirinci yıkayıp suyla tamamen yumuşayana kadar haşla.",
      "Sütü ve şekeri ekleyip karıştırarak kaynat.",
      "Daha koyu bir kıvam için nişastayı az suyla açıp tencereye ekle.",
      "Vanilini ekleyip birkaç dakika daha pişir.",
      "Sütlacı kaselere paylaştırıp soğut ve tarçınla servis et.",
    ],
  },
  {
    slug: "revani",
    name: "Revani",
    category: "Tatlı",
    timeMinutes: 70,
    difficulty: "Orta",
    baseServings: 10,
    diets: ["vegetarian"],
    ingredients: [
      ingredient("Yumurta", 3, "adet"),
      ingredient("Toz şeker", 4, "su bardağı", {
        preparation: "1 su bardağı hamur, 3 su bardağı şerbet için",
      }),
      ingredient("Yoğurt", 1, "su bardağı"),
      ingredient("İrmik", 1, "su bardağı"),
      ingredient("Un", 1, "su bardağı"),
      ingredient("Sıvı yağ", 0.5, "su bardağı"),
      ingredient("Kabartma tozu", 1, "paket"),
      ingredient("Limon kabuğu", 1, "tatlı kaşığı", { preparation: "rendelenmiş", optional: true }),
      ingredient("Su", 3, "su bardağı"),
      ingredient("Limon suyu", 1, "tatlı kaşığı"),
    ],
    steps: [
      "Su ve şekeri kaynatıp limon suyunu ekleyerek şerbeti hazırla ve soğut.",
      "Yumurta ve şekeri köpürene kadar çırp.",
      "Yoğurt, sıvı yağ, irmik, un, kabartma tozu ve limon kabuğunu ekleyip karıştır.",
      "Karışımı yağlanmış tepsiye dök.",
      "180 derece fırında üzeri kızarana kadar pişir.",
      "Sıcak revaninin üzerine soğuk şerbeti döküp dinlendir.",
    ],
  },
];

const pantryStaples = new Set([
  "Su",
  "Tuz",
  "Karabiber",
  "Pul biber",
  "Kuru nane",
  "Nane",
  "Zeytinyağı",
  "Sıvı yağ",
  "Toz şeker",
  "Tarçın",
]);

function upsertRecipe(recipe: SeedRecipe): number {
  const existing = db
    .select({ id: recipes.id })
    .from(recipes)
    .where(eq(recipes.slug, recipe.slug))
    .all()[0];

  if (existing) {
    db.update(recipes)
      .set({
        name: recipe.name,
        category: recipe.category,
        cuisine: CUISINE,
        timeMinutes: recipe.timeMinutes,
        difficulty: recipe.difficulty,
        baseServings: recipe.baseServings,
        note: recipe.note ?? null,
        isActive: true,
      })
      .where(eq(recipes.id, existing.id))
      .run();
    return existing.id;
  }

  const inserted = db
    .insert(recipes)
    .values({
      slug: recipe.slug,
      name: recipe.name,
      category: recipe.category,
      cuisine: CUISINE,
      timeMinutes: recipe.timeMinutes,
      difficulty: recipe.difficulty,
      baseServings: recipe.baseServings,
      note: recipe.note ?? null,
      isActive: true,
    })
    .returning({ id: recipes.id })
    .all()[0];

  return inserted.id;
}

function upsertIngredient(item: SeedIngredient): number {
  const normalizedName = normalizeIngredientName(item.name);
  const existing = db
    .select({ id: ingredients.id })
    .from(ingredients)
    .where(eq(ingredients.normalizedName, normalizedName))
    .all()[0];

  if (existing) return existing.id;

  const inserted = db
    .insert(ingredients)
    .values({
      name: item.name,
      normalizedName,
      isPantryStaple: pantryStaples.has(item.name),
    })
    .returning({ id: ingredients.id })
    .get();

  return inserted.id;
}

db.transaction(() => {
  for (const recipe of seedRecipes) {
    const recipeId = upsertRecipe(recipe);

    db.delete(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, recipeId))
      .run();
    db.delete(recipeSteps).where(eq(recipeSteps.recipeId, recipeId)).run();
    db.delete(recipeDiets).where(eq(recipeDiets.recipeId, recipeId)).run();

    const ingredientRows = recipe.ingredients.map((item) => ({
      recipeId,
      ingredientId: upsertIngredient(item),
      quantity: item.quantity,
      unit: item.unit,
      quantityText: item.quantityText ?? null,
      preparation: item.preparation ?? null,
      isOptional: item.optional ?? false,
    }));

    db.insert(recipeIngredients).values(ingredientRows).run();

    db.insert(recipeSteps)
      .values(
        recipe.steps.map((instruction, index) => ({
          recipeId,
          stepOrder: index + 1,
          instruction,
        }))
      )
      .run();

    if (recipe.diets.length > 0) {
      db.insert(recipeDiets)
        .values(
          recipe.diets.map((diet) => ({
            recipeId,
            diet,
          }))
        )
        .run();
    }
  }
});

const counts = {
  recipes: db.select({ id: recipes.id }).from(recipes).all().length,
  ingredients: db.select({ id: ingredients.id }).from(ingredients).all().length,
  recipeIngredients: db
    .select({ recipeId: recipeIngredients.recipeId })
    .from(recipeIngredients)
    .all().length,
  recipeSteps: db.select({ recipeId: recipeSteps.recipeId }).from(recipeSteps).all()
    .length,
  recipeDiets: db.select({ recipeId: recipeDiets.recipeId }).from(recipeDiets).all()
    .length,
};

console.log(`Seed tamamlandı: ${counts.recipes} tarif, ${counts.ingredients} ingredient.`);
console.log(JSON.stringify(counts, null, 2));
