import React from 'react'
import { getCafeteriasWithDetails } from '@/app/actions/cafeteria-v2-actions'

export const dynamic = 'force-dynamic'

export default async function StudentCafeteriasPage() {
  const { success, data, error } = await getCafeteriasWithDetails()

  if (!success) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Nearby Cafeterias</h1>
        <p className="text-red-500 mt-4">Failed to load cafeterias. {String(error)}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nearby Cafeterias & Mess</h1>
        <p className="text-sm text-muted-foreground mt-1">Find food options around campus. Tap any card to view details.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((cafe) => (
          <div key={cafe.id} className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{cafe.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{cafe.type.replace('_', ' ')}</p>
                </div>
              </div>
              {cafe.address && (
                <p className="text-sm text-muted-foreground mt-2">{cafe.address}</p>
              )}
              {cafe.contact_info && (
                <p className="text-sm text-muted-foreground mt-1">{cafe.contact_info}</p>
              )}
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* Mess details */}
              {cafe.mess_details && (
                <div className="rounded-md bg-muted/40 p-3">
                  <p className="font-medium text-sm">Mess (Tiffin) Rates</p>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">1 time/day</p>
                      <p className="font-semibold">₹{cafe.mess_details.one_time_rate ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">2 times/day</p>
                      <p className="font-semibold">₹{cafe.mess_details.two_time_rate ?? '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu */}
              <div>
                <p className="font-medium text-sm">Popular Items</p>
                <div className="mt-2 space-y-2">
                  {(cafe.menu_items ?? []).slice(0, 6).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <p className="truncate pr-2">{item.name}</p>
                      <p className="font-semibold whitespace-nowrap">₹{Number(item.price).toFixed(2)}</p>
                    </div>
                  ))}
                  {(!cafe.menu_items || cafe.menu_items.length === 0) && (
                    <p className="text-sm text-muted-foreground">Menu not added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
