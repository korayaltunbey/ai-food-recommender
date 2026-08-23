# Akşam Ne Yesem? (ai-food-recommender)

Dolaptaki malzemeleri verip sana o malzemelerle bir yemek öneren, kişi sayısına göre ölçeklenmiş ölçüleri ve adım adım tarifi sunan web uygulaması.

## Özellikler

- **Dolaptakilerle Tarif:** Malzemeleri yaz, AI o malzemeleri önceliklendirerek yemekler önersin (eksik olan birkaç tamamlayıcı malzemeyi de belirtir).
- **Bana Öner:** Malzeme girmeden, sadece kişi sayısı ve tercihlerle yemek önerisi.
- **Çoklu ve çeşitli öneri:** Her seferinde **5 farklı yemek** listelenir (farklı tür ve ana malzeme), birine tıklayınca tam tarif açılır.
- **Tekrar engelleme:** Daha önce önerilen yemekler otomatik hatırlanır ve bir daha önerilmez (son 100).
- **Yaptığım yemekler:** Ana sayfadan eklediğin yemekler ve benzerleri önerilmez; tarif ekranındaki "Yaptım, önerme" butonuyla tek tıkla ekleyebilirsin.
- Ölçüler **kaç kişilikse ona göre ölçeklenir**.
- İsteğe bağlı filtreler: diyet tercihi, toplam süre, mutfak/yöre.
- Öneriyi kopyalama ve tarayıcıda (localStorage) kaydetme.

## Kurulum

1. Bağımlılıkları kur:
   ```bash
   npm install
   ```

2. API anahtarını ayarla — `.env.local` oluştur (`.env.local.example` kopyası):
   ```
   DEEPSEEK_API_KEY=sk-...
   ```
   Anahtarı [platform.deepseek.com](https://platform.deepseek.com) adresinden alabilirsin. Anahtar sadece sunucuda kullanılır, tarayıcıya asla gönderilmez.

3. Geliştirme sunucusunu başlat:
   ```bash
   npm run dev
   ```

4. Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini aç.

## Yapılandırma

| Değişken            | Varsayılan        | Açıklama                        |
| ------------------- | ----------------- | ------------------------------- |
| `DEEPSEEK_API_KEY`  | — (zorunlu)       | DeepSeek API anahtarı           |
| `DEEPSEEK_MODEL`    | `deepseek-chat`   | Kullanılacak model adı          |

## Komutlar

```bash
npm run dev      # geliştirme sunucusu
npm run build    # üretim derlemesi
npm run start    # üretim sunucusu
npm run lint     # ESLint
```

## Proje yapısı

```
app/
  page.tsx              # Ana sayfa: mod kartları + yaptığım yemekler + geçmiş
  oneri/page.tsx        # Form + iki adımlı sonuç (liste → tarif)
  error.tsx             # Sayfa hata sınırı (Türkçe "Tekrar Dene" ekranı)
  global-error.tsx      # Kök hata sınırı
  api/suggest/route.ts  # 5 farklı yemek listesi döndürür
  api/recipe/route.ts   # Seçilen yemeğin tam tarifini döndürür
  components/
    InlineScript.tsx    # Hydration-güvenli inline script (tema başlatma)
components/
  Header.tsx            # Üst bar (logo + tema butonu)
  ThemeToggle.tsx       # Açık/koyu tema butonu
  MalzemeGirisi.tsx     # Malzeme çipi girişi + sık kullanılanlar
  TarifKarti.tsx        # Tarif gösterimi
  OneriClient.tsx       # Öneri akışı (liste, seçim, tarif)
lib/
  types.ts              # Ortak tipler
  store.ts              # Ortak localStorage depo fabrikası (createArrayStore)
  theme.ts              # Tema yönetimi (açık/koyu)
  recipes.ts            # Prompt kurucular + JSON doğrulama
  requests.ts           # İstek gövdesi doğrulama
  deepseek.ts           # DeepSeek API çağrısı (anahtar burada kullanılır)
  history.ts            # Kaydedilen tarifler (localStorage)
  made.ts               # Yaptığım yemekler listesi (localStorage)
  suggested.ts          # Öneri geçmişi / tekrar engelleme (localStorage)
```
