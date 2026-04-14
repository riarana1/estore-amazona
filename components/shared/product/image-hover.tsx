'use client'
import Image from 'next/image'
import { useState, useRef } from 'react'

const ImageHover = ({
  src,
  hoverSrc,
  alt,
}: {
  src: string
  hoverSrc: string
  alt: string
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => setIsHovered(true), 1000) // 1 second delay
  }

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setIsHovered(false)
  }

  return (
    <div
      className="relative h-52"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="80vw"
        className={`transition-opacity duration-500 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ objectFit: 'contain' }}
      />
      <Image
        src={hoverSrc}
        alt={alt}
        fill
        sizes="80vw"
        className={`transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}

export default ImageHover
