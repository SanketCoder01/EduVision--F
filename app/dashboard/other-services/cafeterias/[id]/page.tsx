import React from 'react'
import { notFound } from 'next/navigation'
import { getCafeteriaByIdWithDetails } from '@/app/actions/cafeteria-v2-actions'
import CafeteriaDetailTabs from '@/components/cafeteria/CafeteriaDetailTabs'

export const dynamic = 'force-dynamic'

function Section() { return null }

export default async function CafeteriaDetailPage({ params }: { params: { id: string } }) {
  const { success, data } = await getCafeteriaByIdWithDetails(params.id)
  if (!success || !data) return notFound()
  const cafe = data

  return (
    <div className="p-6">
      <CafeteriaDetailTabs cafe={cafe as any} />
    </div>
  )
}
