'use client'

import React, { use } from 'react'
import Link from 'next/link'
import EventPanel from '@/components/EventPanel'
import { ArrowLeft, Radio } from 'lucide-react'

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.id

  return (
    <div className="flex flex-col h-screen bg-[#0D1117] text-[#F0F6FC] font-mono">
      {/* Detail Header */}
      <div className="h-14 bg-[#161B22] border-b border-[#30363D] px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard"
            className="flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold px-2 py-1 rounded bg-[#1F242C] border border-[#30363D]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO C2 DASHBOARD</span>
          </Link>
          <div className="h-4 w-[1px] bg-[#30363D]" />
          <span className="text-sm font-bold text-white tracking-wider">
            HAZARD DEEP-DIVE: {eventId}
          </span>
        </div>
      </div>

      {/* Main Inspection Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 overflow-hidden">
        <div className="h-full bg-[#161B22] rounded border border-[#30363D] shadow-2xl overflow-hidden">
          <EventPanel eventId={eventId} timeline={0} />
        </div>
      </div>
    </div>
  )
}
