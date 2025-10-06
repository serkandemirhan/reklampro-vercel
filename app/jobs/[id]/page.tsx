import StepsTable from './StepsTable'

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
