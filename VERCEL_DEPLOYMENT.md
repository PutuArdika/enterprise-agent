# Vercel Deployment — Environment Variables Setup

Panduan ini mencantumkan semua environment variable yang harus dikonfigurasi di **Vercel Dashboard → Project → Settings → Environment Variables** sebelum deploy.

---

## Wajib (Required)

### 1. Database — Neon PostgreSQL

| Variable | Keterangan |
|---|---|
| `DATABASE_URL` | Connection string Neon dengan SSL |

**Nilai:**
```
postgresql://neondb_owner:<password>@<endpoint>.neon.tech/neondb?sslmode=require
```

> Dapatkan dari: [console.neon.tech](https://console.neon.tech) → Project → **Connection Details** → copy **Connection string**.

---

### 2. OpenAI

| Variable | Keterangan |
|---|---|
| `OPENAI_API_KEY` | API key untuk chat completion & embeddings |

**Nilai:** `sk-proj-...`

> Dapatkan dari: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

---

### 3. URL Aplikasi

| Variable | Keterangan |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL publik deployment Vercel (digunakan client-side) |

**Nilai (setelah deploy pertama):**
```
https://<your-project>.vercel.app
```

> Atau gunakan custom domain jika sudah dikonfigurasi.

---

## Opsional — Embedding & PDF Processing

Variabel berikut sudah memiliki default value. Hanya perlu diset jika ingin mengubah konfigurasinya.

| Variable | Default | Keterangan |
|---|---|---|
| `EMBEDDING_MODEL` | `text-embedding-3-small` | Model embedding OpenAI |
| `EMBEDDING_DIMENSION` | `1536` | Dimensi vector embedding |
| `CHUNK_SIZE` | `1000` | Ukuran chunk teks (karakter) |
| `CHUNK_OVERLAP` | `200` | Overlap antar chunk |

---

## Opsional — Gmail Integration

Diperlukan hanya jika fitur pencarian CV via Gmail digunakan.

| Variable | Keterangan |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret |
| `GOOGLE_REDIRECT_URI` | **Harus diubah ke URL production** |

**Nilai `GOOGLE_REDIRECT_URI` untuk production:**
```
https://<your-project>.vercel.app/api/gmail/callback
```

> ⚠️ Setelah mengubah redirect URI, tambahkan juga URL ini di **Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client → Authorized redirect URIs**.

---

## Variabel yang TIDAK Perlu Diset di Vercel

| Variable | Alasan |
|---|---|
| `NODE_ENV` | Vercel otomatis set ke `production` |

---

## Ringkasan — Checklist Deploy

```
☐ DATABASE_URL          → Neon connection string (wajib)
☐ OPENAI_API_KEY        → OpenAI key (wajib)
☐ NEXT_PUBLIC_API_URL   → https://<your-project>.vercel.app (wajib)
☐ EMBEDDING_MODEL       → text-embedding-3-small (opsional)
☐ EMBEDDING_DIMENSION   → 1536 (opsional)
☐ CHUNK_SIZE            → 1000 (opsional)
☐ CHUNK_OVERLAP         → 200 (opsional)
☐ GOOGLE_CLIENT_ID      → (opsional, untuk Gmail)
☐ GOOGLE_CLIENT_SECRET  → (opsional, untuk Gmail)
☐ GOOGLE_REDIRECT_URI   → https://...vercel.app/api/gmail/callback (opsional, untuk Gmail)
```

---

## Langkah Deploy

1. Push code ke GitHub: `git push origin main`
2. Login ke [vercel.com](https://vercel.com) → **Add New Project** → Import repo `PutuArdika/enterprise-agent`
3. Vercel auto-detect Next.js — tidak perlu mengubah build settings
4. Masuk ke **Environment Variables** dan isi semua variabel dari checklist di atas
5. Klik **Deploy**
6. Setelah deploy selesai, update `NEXT_PUBLIC_API_URL` dengan URL yang diberikan Vercel, lalu **Redeploy**

---

## Catatan Tambahan

- File `.env.local` **tidak** di-upload ke Vercel — harus diinput manual via dashboard atau Vercel CLI (`vercel env pull`)
- Neon free tier: koneksi pooler sudah digunakan (`-pooler` di hostname), aplikasi ini mengatur `max: 5` connection secara otomatis
- Pastikan migration database sudah dijalankan sebelum deploy: jalankan `npm run db:migrate` dari mesin lokal dengan `DATABASE_URL` production
