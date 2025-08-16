import React from 'react'
import { notFound } from 'next/navigation'
import { getCafeteriaByIdWithDetails } from '@/app/actions/cafeteria-v2-actions'

export const dynamic = 'force-dynamic'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="border-b p-4">
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export default async function StudentCafeteriaDetailPage({ params }: { params: { id: string } }) {
  const { success, data } = await getCafeteriaByIdWithDetails(params.id)
  if (!success || !data) return notFound()
  const cafe = data

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{cafe.name}</h1>
        <p className="text-sm text-muted-foreground capitalize">{cafe.type.replace('_', ' ')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* About */}
          <Section title="About">
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{cafe.address || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contact</p>
                <p className="font-medium">{cafe.contact_info || '—'}</p>
              </div>
            </div>
          </Section>

          {/* Menu */}
          <Section title="Menu">
            {cafe.menu_items && cafe.menu_items.length > 0 ? (
              <div className="divide-y">
                {cafe.menu_items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                    <div className="pr-2">
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-muted-foreground text-xs mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <div className="font-semibold whitespace-nowrap">₹{Number(item.price).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No menu items added yet.</p>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          {/* Images */}
          <Section title="Images">
            {cafe.images && cafe.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {cafe.images.map((src, i) => (
                  <img key={i} src={src} alt={`${cafe.name} ${i + 1}`} className="h-28 w-full object-cover rounded-md" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
            )}
          </Section>

          {/* Mess details (if applicable) */}
          {cafe.mess_details && (
            <Section title="Mess / Tiffin Rates">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">1 time/day</p>
                  <p className="font-semibold">₹{cafe.mess_details.one_time_rate ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">2 times/day</p>
                  <p className="font-semibold">₹{cafe.mess_details.two_time_rate ?? '—'}</p>
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}
