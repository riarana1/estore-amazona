'use client'
import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import useDeviceType from '@/hooks/use-device-type'
import { Button } from '../ui/button'

export default function CollapsibleOnMobile({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()

  const deviceType = useDeviceType()
  const [open, setOpen] = useState(false)

  // Better: Adjust state during render to avoid cascading renders
  const [prevDeviceType, setPrevDeviceType] = useState(deviceType)
  const [prevSearchParams, setPrevSearchParams] = useState(
    searchParams.toString(),
  )

  if (
    deviceType !== prevDeviceType ||
    searchParams.toString() !== prevSearchParams
  ) {
    setPrevDeviceType(deviceType)
    setPrevSearchParams(searchParams.toString())
    setOpen(deviceType === 'desktop')
  }

  if (deviceType === 'unknown') return null
  return (
    <Collapsible open={open}>
      <CollapsibleTrigger asChild>
        {deviceType === 'mobile' && (
          <Button
            onClick={() => setOpen(!open)}
            variant={'outline'}
            className="w-full"
          >
            {title}
          </Button>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}
