import StepsTable from './StepsTable'// dosyanın üstüne ekleyin
import AssignUserCell from './AssignUserCell'
// app/jobs/[id]/page.tsx
import Link from 'next/link' // ⬅️ ekle

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const jobId = Number(params.id)

  // ... mevcut veri yükleme kodların ...

  return (
    <div>
      {/* ÜST BAŞLIK SATIRI */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">İş Detayı</h1>

        {/* ➜ Görev ekranı butonu */}
        <Link href={`/jobs/${jobId}/tasks`} className="btn btn-sm">
          Görev ekranını aç
        </Link>
      </div>

      {/* ... sayfanın kalan kısmı (formlar, adımlar tablosu vs.) ... */}
    </div>
  )
}


// ... tablo başlıklarında:
<th>Sorumlu</th>

// ... satır renderında (s: adım kaydı)
<td>
  <AssignUserCell
    stepId={s.id}
    value={s.assigned_user /* varsa kolon adını uyarlayın */}
    onSaved={refetchSteps /* varsa listeyi yenileyen fonksiyonunuz */}
  />
</td>


// ...
export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const jobId = Number(params.id)
  // ... mevcut iş detayı kodların ...

  return (
    <div>
      {/* ... üst kısımlar (Başlık, Açıklama, Durum, Müşteri, vb.) ... */}
      
      <section className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Adımlar</h3>
        <StepsTable jobId={jobId} />
      </section>
    </div>
  )
}
