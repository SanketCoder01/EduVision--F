import React from 'react'
import { getCafeteriasWithDetails } from '@/app/actions/cafeteria-v2-actions'
import Link from 'next/link'
import * as Tabs from '@radix-ui/react-tabs'

export const dynamic = 'force-dynamic'

export default async function CafeteriasDashboardPage() {
  console.log('🏪 Loading cafeterias page...')
  const { success, data, error } = await getCafeteriasWithDetails()
  console.log('📋 Page result:', { success, dataLength: data?.length, error })

  if (!success) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Cafeterias</h1>
        <p className="text-red-500 mt-4">Failed to load cafeterias.</p>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium">Error Details</summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm font-medium text-yellow-800">Troubleshooting Steps:</p>
          <ol className="mt-2 text-sm text-yellow-700 list-decimal list-inside space-y-1">
            <li>Run the cafeteria migration: <code className="bg-yellow-100 px-1 rounded">supabase/migrations/create-cafeteria-module.sql</code></li>
            <li>Check if the <code className="bg-yellow-100 px-1 rounded">cafeterias</code> table exists in your database</li>
            <li>Verify RLS policies are enabled</li>
          </ol>
        </div>
      </div>
    )
  }

  // Separate cafeterias and mess
  const cafeterias = data?.filter(cafe => cafe.type === 'cafeteria') || []
  const mess = data?.filter(cafe => cafe.type === 'mess' || cafe.type === 'cafe_mess') || []

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Nearby Cafeterias & Mess</h1>
        <p className="text-muted-foreground mt-1 text-sm">Find options near campus</p>
      </div>

      {!data || data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No cafeterias found.</p>
        </div>
      ) : (
        <Tabs.Root defaultValue={cafeterias.length ? 'cafeteria' : 'mess'}>
          <div className="mb-2">
            <Tabs.List className="grid grid-cols-2 gap-2">
              <Tabs.Trigger value="cafeteria" className="px-3 py-2 rounded-full text-xs font-medium bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Cafeteria
              </Tabs.Trigger>
              <Tabs.Trigger value="mess" className="px-3 py-2 rounded-full text-xs font-medium bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Mess
              </Tabs.Trigger>
            </Tabs.List>
          </div>

          <Tabs.Content value="cafeteria">
            {cafeterias.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cafeterias available.</p>
            ) : (
              <ul className="space-y-3">
                {cafeterias.map((cafe) => (
                  <li key={cafe.id} className="rounded-lg border bg-white shadow-sm">
                    <Link href={`/dashboard/other-services/cafeterias/${cafe.id}`} className="flex items-center justify-between px-4 py-3 active:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{cafe.name}</p>
                        <p className="text-[10px] text-orange-600 font-semibold mt-1">CAFETERIA</p>
                      </div>
                      <span aria-hidden className="text-gray-400">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Tabs.Content>

          <Tabs.Content value="mess">
            {mess.length === 0 ? (
              <p className="text-sm text-muted-foreground">No mess services available.</p>
            ) : (
              <ul className="space-y-3">
                {mess.map((cafe) => (
                  <li key={cafe.id} className="rounded-lg border bg-white shadow-sm">
                    <Link href={`/dashboard/other-services/cafeterias/${cafe.id}`} className="flex items-center justify-between px-4 py-3 active:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{cafe.name}</p>
                        <p className="text-[10px] text-green-600 font-semibold mt-1">{cafe.type === 'mess' ? 'MESS' : 'MESS & CAFE'}</p>
                      </div>
                      <span aria-hidden className="text-gray-400">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Tabs.Content>
        </Tabs.Root>
      )}
    </div>
  )
}
