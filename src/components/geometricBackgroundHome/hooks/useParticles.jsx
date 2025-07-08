import { useRef, useCallback } from 'react'
import { createParticles } from '../utils/particle'

export const useParticles = (config) => {
    const particlesRef = useRef([])
    const initializedRef = useRef(false)

    const initParticles = useCallback((canvas) => {
        if (!initializedRef.current) {
            particlesRef.current = createParticles(canvas, config)
            initializedRef.current = true
        }
    }, [config])

    const resetParticles = useCallback(() => {
        particlesRef.current = []
        initializedRef.current = false
    }, [])

    return {
        particles: particlesRef.current,
        initParticles,
        resetParticles
    }
}