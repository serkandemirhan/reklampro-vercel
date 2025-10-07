# ReklamPro Yönetim Uygulaması UI Yenileme Planı

Bu belge, kullanıcıdan gelen yeni ekran örneklerine uyum sağlamak için mevcut Next.js + Supabase tabanlı uygulamada yapılması gereken güncellemeleri adım adım özetler. Hedef; süreç, makine, kullanıcı ve rol yönetimi ile iş talebi akışlarının tek bir deneyim içinde tutarlı ve fonksiyonel şekilde sunulmasıdır.

## 1. Genel Mimari Yaklaşım

1. **Modüler Bileşen Yapısı**  
   - `components/admin` altında süreç/makine/rol/kullanıcı yönetimi tablolarını yeniden kullanılabilir bileşenler olarak tasarlayın.  
   - Tablo başlıkları, veri satırları ve alt satırdaki "ekleme" formları için ayrı alt bileşenler tanımlayın.

2. **Sunucu Verileri**  
   - `process_templates`, `role_permissions`, `machines` (yeni tablo) ve `users` için veri erişimini `lib/api.ts` aracılığıyla tek noktadan yönetin.  
   - Yeni tablolar gerekiyorsa Supabase şemasına migration ekleyin (örn. `machines`, `roles`, `user_roles`).

3. **Form Yönetimi**  
   - Uzun formlar için `react-hook-form` + `zod` doğrulama kullanımı planlanmalı.  
   - Çoklu seçimli rol atamaları için `Listbox` veya `Combobox` (Headless UI) bileşenleri kullanılabilir.

4. **Stil ve Düzen**  
   - Tüm ekranlarda `grid`/`flex` düzenleri ile iki sütunlu kart yapısı kurun.  
   - Durum göstergeleri için tutarlı renk kodları (`success`, `warning`, `danger`, `muted`) belirleyin.  
   - İkonlu butonlar (örn. "💾 Kaydet") için `components/ui/IconButton.tsx` gibi yardımcı bileşen ekleyin.

## 2. Süreç ve Makine Yönetimi Ekranı

1. **Süreç Yönetimi Tablosu**  
   - Kolonlar: `Sıra`, `Süreç Adı`, `Sorumlu Rol`, `Paralel?`, `Makine Bazlı?`, `Üretim Süreci?`, `İşlem`.  
   - Satır düzenleme modunda checkbox üçlemesi (`Paralel`, `Makine Bazlı`, `Üretim`).  
   - Her satır için `[Güncelle]`, `[Sil]` butonları, alt satırda yeni süreç ekleme formu.  
   - Supabase'de süreç tablosuna yeni boolean alanlar eklenmeli: `is_parallel`, `is_machine_based`, `is_production`.

2. **Makine Yönetimi Tablosu**  
   - Yeni `machines` tablosu: `id`, `name`, `process_id`, `status`, `note`, `order_index`.  
   - `status` için enum benzeri değerler (`active`, `maintenance`, `inactive`).  
   - UI'da süreç dropdown'ı Supabase'den gelen süreç listesi ile doldurulacak.

3. **Veri Senkronizasyonu**  
   - CRUD işlemleri için `/api/processes` ve `/api/machines` uç noktalarını genişletin.  
   - Silme işlemlerinde yumuşak silme (`deleted_at`) tercihi değerlendirilmelidir.

## 3. Rol & Kullanıcı Yönetimi

1. **Rol Tablosu Şeması**  
   - Supabase'de `roles` tablosu: `id`, `name`, `is_admin`.  
   - `role_permissions` tablosunu süreç kolonlarına göre pivotlamak için `resource` alanını süreç kimliği ile eşleyin (`process:<id>`).

2. **UI Düzeni**  
   - Rol tablosunda her süreç için üç checkbox seti (`Gör`, `Yaz`, `Sil`).  
   - Admin yetkisi için tek checkbox.  
   - Yeni süreç eklendiğinde front-end tarafında tablo kolonları dinamik olarak güncellenecek; Supabase trigger'ı ile varsayılan izinler oluşturulabilir.

3. **Kullanıcı Yönetimi**  
   - Kullanıcı listesi `auth.users` ve `user_profiles` (varsa) birleşiminden okunacak.  
   - Rol atamaları için `user_roles` ilişkisel tablosu kullanılarak çoklu seçim desteği sağlanacak.  
   - `[Güncelle]` butonu kullanıcı detay modal'ı açarak roller ve iletişim bilgileri düzenlenebilir.

## 4. Yeni İş Talebi Oluşturma

1. **Form Bölümleri**  
   - Tek sayfa, scroll ile ilerleyen yapı; her bölüm `card` içinde başlık ve içerik.  
   - Müşteri seçimi için arama yapılabilir dropdown, "Yeni Müşteri" modal'ı ile entegre.

2. **Süreç Satırları**  
   - Süreç listesi `process_templates` tablosundan çekilir.  
   - Her satırda sorumlu rol dropdown'ı, boolean alanlar, işlem butonları.  
   - Yeni süreç ekleme, geçici satır olarak formda tutulur; kaydettiğinde ilgili step instanceları oluşturulur.

3. **Dosya ve Not Alanları**  
   - Dosya yükleme için mevcut `/api/upload` uç noktası kullanılabilir.  
   - Notlar `job_requests.notes` alanına veya ayrı `job_notes` tablosuna kaydedilebilir.

4. **İşlem Butonları**  
   - "Kaydet", "Taslak", "İptal" butonları; taslak durumda `status='draft'` kaydı oluşturur.

## 5. İş Talebi Süreç Akışı (Yönetici Görünümü)

1. **Zaman Çizelgesi Bileşeni**  
   - `components/jobs/JobTimeline.tsx` oluşturarak süreçlerin sıralı kutucuklarla gösterimi.  
   - Durum renkleri: Tamamlandı (yeşil), Devam (sarı), Beklemede (gri), Durduruldu (kırmızı).

2. **Detay Kartları**  
   - Her süreç için başlık, sorumlu, tarih, açıklama, üretim notu, makine gibi alanlar.  
   - Supabase `step_instances` tablosuna `production_note`, `machine_id`, `start_at`, `end_at` alanları eklenmeli.

3. **Yönetici Özet Tablosu**  
   - `DataTable` bileşeni ile tablo; sıralama ve filtreleme desteklenir.  
   - "Makine Durumunu Gör" gibi butonlar ilgili modalları açar.

## 6. Operatör Görev ve Üretim Ekranı

1. **Görev Listesi**  
   - Kullanıcının rollerine göre filtrelenmiş `step_instances` tablosu.  
   - "Başlat/Bitir" butonları için durum makinesi: `pending → in_progress → completed`.

2. **Görev Detay Formu**  
   - Üretim notu, açıklama, üretim miktarı, dosya yükleme alanları.  
   - İşlem butonları `PATCH /api/steps/:id` ile durum ve metrik günceller.

3. **Makine Durumu Paneli**  
   - `machines` tablosu ile ilişkilendirilmiş aktif görevler.  
   - Operatöre sadece yetkili olduğu süreçlere bağlı makineler gösterilir.

## 7. Yeni Müşteri Oluşturma Formu

1. **Çoklu Şube Yönetimi**  
   - `customer_branches` tablosu: `id`, `customer_id`, `name`, `address`, `city`, `country`, `contact`.  
   - UI'da tablo + inline ekleme satırı.

2. **Dosya Yüklemeleri**  
   - Logo ve dokümanlar için `customer_files` tablosu.  
   - Dosya tiplerine göre doğrulama (png/jpg, pdf/docx).  
   - Logo yüklendiyse müşteri listesinde küçük önizleme gösterilecek.

3. **Notlar ve Etiketler**  
   - `customer_tags` + `tags` ilişkili tablo yapısı veya JSONB alanı.  
   - Tag seçimi için çoklu seçim bileşeni.

4. **İşlem Butonları**  
   - Kaydet sonrası otomatik müşteri numarası üretimi için Supabase trigger (`generate_customer_no`).

## 8. Teknik Yol Haritası

1. **Hafta 1**
   - Veri tabanı şema güncellemeleri ve API uç noktalarının hazırlanması.
   - Süreç & Makine yönetimi arayüzlerinin temel hali.

2. **Hafta 2**  
   - Rol & kullanıcı yönetimi tabloları + izin matrisi.  
   - Yeni müşteri formunun çekirdek işlevleri.

3. **Hafta 3**  
   - İş talebi oluşturma formu + süreç akışı bileşenleri.  
   - Operatör görev ekranı yenilemesi.

4. **Hafta 4**  
   - Stil iyileştirmeleri, PDF çıktı entegrasyonları, test ve dokümantasyon.  
   - Kullanıcı kabul testi (UAT) için demo verilerle doğrulama.

## 9. Riskler ve Notlar

- Supabase tablo değişiklikleri mevcut veriyi etkileyebilir; migration öncesi yedek alın.  
- Çoklu checkbox/izin yapılarında UI karmaşıklığı artar; performans için `virtualized table` düşünülmeli.  
- Dosya yükleme kotaları ve güvenlik (rol bazlı erişim) gözden geçirilmeli.
- PDF çıktı ihtiyaçları için `@react-pdf/renderer` veya sunucu taraflı çözüm değerlendirilmeli.

## 10. İş Paketleri ve Alt Görev Listesi

Aşağıdaki iş paketleri, yukarıdaki mimari planın uygulanabilir adımlara dönüştürülmüş halidir. Her paket sprint planlamasında bağımsız hikâye (story) olarak ele alınabilir. Alt maddeler, geliştirme veya QA sırasında tamamlanması gereken görevlerdir.

### EPIC A — Veri Tabanı & API Altyapısı

1. **Migration Hazırlığı**
   - [ ] Supabase şemasına `machines`, `roles`, `role_permissions`, `user_roles`, `customer_branches`, `customer_files`, `customer_tags` tablolarını ekle.
   - [ ] Mevcut `process_templates` ve `step_instances` tablolarına gerekli yeni alanları (`is_parallel`, `is_machine_based`, `is_production`, `production_note`, `machine_id`, `start_at`, `end_at`) ekle.
   - [ ] Migration dosyaları için rollback senaryolarını yaz ve QA ortamında çalıştır.

2. **API Katmanı Güncellemeleri**
   - [ ] `/api/processes`, `/api/machines`, `/api/roles`, `/api/users`, `/api/customers` uç noktalarını yeni alanlarla uyumlu hale getir.
   - [ ] Step durum güncellemeleri için `/api/steps/:id` PATCH uç noktasını oluştur.
   - [ ] Dosya yükleme işlemlerini `customer_files` ve `job_files` tabloları ile ilişkilendir.

3. **Yetkilendirme Kontrolleri**
   - [ ] API katmanında rol bazlı erişim doğrulamasını merkezi middleware'e taşı.
   - [ ] Admin kullanıcılar için genişletilmiş izin setini doğrula.

### EPIC B — Yönetim Paneli Tabloları

1. **Süreç Yönetimi**
   - [ ] `components/admin/processes/ProcessTable.tsx` bileşenini oluştur.
   - [ ] Sıra sürükle-bırak desteğini ekle (opsiyonel backlog: ayrı story).
   - [ ] Yeni süreç ekleme satırı ve güncelle/sil diyaloglarını bağla.

2. **Makine Yönetimi**
   - [ ] `components/admin/machines/MachineTable.tsx` bileşeni ile süreç dropdown'ını entegre et.
   - [ ] Makine durumu rozetlerini (`Aktif`, `Bakımda`, `Pasif`) renklendir.
   - [ ] Makine ekleme/güncelleme modallarını API ile bağla.

3. **Rol Yönetimi**
   - [ ] Dinamik kolonlu izin matrisi bileşenini oluştur.
   - [ ] `role_permissions` tablosundan gelen veriyi checkbox üçlemesi ile eşle.
   - [ ] Yeni süreç eklendiğinde UI'da kolonların otomatik güncellendiğini test et.

4. **Kullanıcı Yönetimi**
   - [ ] Kullanıcı listesi tablosunu Supabase profilleri ile doldur.
   - [ ] Çoklu rol atama bileşenini (`Combobox`) entegre et.
   - [ ] Kullanıcı güncelleme modal'ında temel iletişim alanlarını düzenlenebilir yap.

### EPIC C — İş Talebi Oluşturma ve Yönetici Akışı

1. **Yeni İş Talebi Formu**
   - [ ] Form bölümlerini (Genel Bilgiler, Süreç Satırları, Dosya & Notlar) kartlar halinde düzenle.
   - [ ] Müşteri seçimi dropdown'ını arama destekli hale getir ve "Yeni Müşteri" modal'ına bağla.
   - [ ] Taslak kaydetme işlevini `status='draft'` mantığı ile doğrula.

2. **Süreç Satırı Yönetimi**
   - [ ] Süreç listesi için `process_templates` verisini hydrate et.
   - [ ] Satır bazlı sorumlu rol seçimleri ve boolean alanları react-hook-form ile yönet.
   - [ ] Yeni satır ekle/sil işlemleri için geçici state + API entegrasyonunu tamamla.

3. **Yönetici Süreç Akışı**
   - [ ] `JobTimeline` bileşenini oluştur ve durum renklerini tanımla.
   - [ ] Süreç detay kartlarını `step_instances` verisi ile doldur.
   - [ ] "Makine Durumunu Gör" gibi buton eylemlerini modal/panel bileşenlerine bağla.

### EPIC D — Operatör Görev Ekranı

1. **Görev Listesi**
   - [ ] Operatöre özel filtrelenmiş görev tablosunu oluştur.
   - [ ] Durum makinesi (`pending`, `in_progress`, `completed`, `paused`) geçişlerini buton aksiyonlarına bağla.
   - [ ] Görev kartı üzerinde makine ve müşteri bilgilerini göster.

2. **Görev Detay Formu**
   - [ ] Üretim notu, açıklama, miktar ve dosya yükleme alanlarını ekle.
   - [ ] "Başlat", "Durdur", "Tamamlandı" butonlarını API çağrılarına bağla.
   - [ ] Dosya yüklemeleri için yükleme durum geri bildirimi ekle.

3. **Makine Durumu Paneli**
   - [ ] Makinelerin mevcut durumunu ve aktif görevlerini gösteren tabloyu oluştur.
   - [ ] Operatörün yetkili olmadığı makineleri filtreleyen sorguyu uygula.
   - [ ] Makine durum değişikliklerinin real-time (Supabase Realtime) ile güncellenmesini backlog'a ekle.

### EPIC E — Müşteri Yönetimi

1. **Yeni Müşteri Formu**
   - [ ] Form bileşenlerini tek sayfalık layoutta grupla.
   - [ ] Şube ekleme tablosunu inline düzenlemeli hale getir.
   - [ ] Kaydetme sonrası müşteri numarası oluşturma trigger'ını test et.

2. **Dosya ve Etiket Yönetimi**
   - [ ] Logo ve doküman yükleme bileşenlerini `customer_files` tablosu ile bağla.
   - [ ] Etiket seçim bileşenini (`TagMultiSelect`) oluştur.
   - [ ] Müşteri listesinde logo thumbnail'ını göster.

3. **Pasifleştirme Akışı**
   - [ ] "Sil/Pasifleştir" işlemini soft delete (`is_active` veya `deleted_at`) ile uygulamaya al.
   - [ ] Pasif müşteriler için filtreleme/sort seçeneklerini ekle.

### EPIC F — Test, Dokümantasyon ve Yayın Hazırlığı

1. **Test Senaryoları**
   - [ ] Cypress veya Playwright ile kritik kullanıcı akışları için E2E testleri yaz.
   - [ ] API için unit/integration testlerini güncelle.
   - [ ] Rol bazlı yetkilendirme için smoke testleri planla.

2. **Dokümantasyon**
   - [ ] README içinde yeni modüller ve kurulumu açıklayan bölüm ekle.
   - [ ] Operasyon ekibi için kısa kullanım kılavuzu hazırlat.

3. **Canlıya Alma Kontrolleri**
   - [ ] Migration'ları staging ortamında dener ve rollback senaryosunu doğrula.
   - [ ] Performans ve güvenlik gözden geçirmesini tamamla.
   - [ ] Yayın sonrası izleme (monitoring) metriklerini güncelle.

---

Bu plan, kapsamlı UI dönüşümü için gerekli adımları ve bağımlılıkları belirtir. Her ana başlık, ayrı user story'ler halinde planlanarak sprint bazlı uygulanmalıdır.
