import { useEffect, useRef } from 'react'

export const useCanvas = (draw, options = {}) => {
    const canvasRef = useRef(null)
    const { fps = 60 } = options

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d', { alpha: false })
        let animationId
        let lastTime = 0
        const fpsInterval = 1000 / fps

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        resizeCanvas()

        const render = (currentTime) => {
            animationId = requestAnimationFrame(render)

            const deltaTime = currentTime - lastTime
            if (deltaTime > fpsInterval) {
                lastTime = currentTime - (deltaTime % fpsInterval)
                draw(context, canvas)
            }
        }

        render(0)
        window.addEventListener('resize', resizeCanvas)

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', resizeCanvas)
        }
    }, [draw, fps])

    return canvasRef
}