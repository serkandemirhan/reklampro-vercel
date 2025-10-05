
# Vercel + Supabase Branch

Bu branch'te tüm API uçları **Next.js Route Handlers** (Vercel Functions) ile yazıldı ve
veriler **Supabase** (Auth, Postgres, Storage, Realtime) üzerinde tutuluyor.

## Kurulum

1. Supabase'te yeni bir proje oluşturun.
2. `supabase/sql/schema.sql` ve `supabase/sql/rls.sql` dosyalarını **Supabase SQL Editor**'da çalıştırın.
3. Vercel projesi oluşturun, bu repo'yu içeri aktarın.
4. **Environment Variables** (Vercel):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Supabase Storage'ta `files` adlı public bir bucket oluşturun.
6. Deploy.

## API
- `/api/processes` GET/POST, `/api/processes/[id]` DELETE
- `/api/customers` GET/POST
- `/api/jobs` GET/POST
- `/api/steps/by-job/[jobId]` GET
- `/api/steps/[id]` PATCH
- `/api/files/upload-init` POST (signed upload url)
- `/api/files/register` POST (job/step ile kaydet)
- `/api/files/by-job/[jobId]` GET
- `/api/files/tree/[jobId]` GET
- `/api/metrics/summary` GET
- `/api/comments/by-job/[jobId]` GET, `/api/comments` POST
- `/api/permissions` GET/POST, `/api/permissions/[id]` DELETE
- `/api/notifications/me` GET/POST
- `/api/calendar` GET/POST, `/api/calendar/[id]` PATCH/DELETE, `/api/calendar/ics` GET
- `/api/export/jobs.csv`, `/api/export/steps.csv`

## Notlar
- RLS politikaları **tenant izolasyonu** sağlar (JWT `app_metadata.tenant_id`).
- Realtime için `step_instances` tablosunu dinleyerek UI'da canlı güncellemeleri tetikleyebilirsiniz.


**Not (Calendar):** PostgreSQL'de `end` anahtar kelime olduğu için `calendar_events` tablosunda
`sütun adları` **start_at / end_at** olarak tanımlandı. API'ler client ile uyum için
gelen/giden veride `start`/`end` alanlarını **otomatik map** eder.
