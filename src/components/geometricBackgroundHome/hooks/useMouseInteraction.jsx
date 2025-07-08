import { useEffect, useRef } from 'react'

export const useMousePosition = (enabled = true) => {
    const mouseRef = useRef({ x: 0, y: 0 })
    const rafRef = useRef(null)

    useEffect(() => {
        if (!enabled) return

        const handleMouseMove = (e) => {
            // Throttle avec RAF pour de meilleures performances
            if (rafRef.current) return

            rafRef.current = requestAnimationFrame(() => {
                mouseRef.current.x = e.clientX
                mouseRef.current.y = e.clientY
                rafRef.current = null
            })
        }

        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
            }
        }
    }, [enabled])

    return mouseRef.current
}