import { useRef, useEffect, useState, useCallback } from 'react'
import styles from './projectCarousel.module.scss'

// Hook personnalisé pour debounce
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null)

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay)
    },
    [callback, delay]
  )
}

export default function ProjectCarousel({ cards = [] }) {
  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [focusedIndex, setFocusedIndex] = useState(0)

  // Stocker les dimensions dans des refs au lieu d'états
  // pour éviter des re-rendus inutiles
  const dimensionsRef = useRef({
    containerWidth: 0,
    itemWidth: 0,
  })

  // Référence pour savoir si le scroll est déclenché par le code
  const isProgrammaticScroll = useRef(false)

  // Méthode pour déterminer la carte au centre
  const updateFocusedIndex = useCallback(() => {
    const container = containerRef.current
    if (!container || cards.length === 0) return

    // Obtenir les coordonnées du centre du container
    const containerRect = container.getBoundingClientRect()
    const containerCenter = containerRect.left + containerRect.width / 2

    // Trouver l'élément dont le centre est le plus proche du centre du container
    let minDistance = Infinity
    let newIndex = 0

    const items = container.querySelectorAll(`.${styles.carouselItem}`)
    items.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect()
      const itemCenter = itemRect.left + itemRect.width / 2
      const distance = Math.abs(containerCenter - itemCenter)

      if (distance < minDistance) {
        minDistance = distance
        newIndex = index
      }
    })

    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex)
    }
  }, [cards.length, focusedIndex])

  // Initialiser les dimensions et configurer le centrage
  useEffect(() => {
    const updateDimensions = () => {
      const container = containerRef.current
      if (!container || cards.length === 0) return

      const containerClientWidth = container.clientWidth
      dimensionsRef.current.containerWidth = containerClientWidth

      // Calculer la largeur réelle d'un item
      const firstItem = container.querySelector(`.${styles.carouselItem}`)
      if (firstItem) {
        const itemRect = firstItem.getBoundingClientRect()
        // Calculer le gap
        const computedStyle = window.getComputedStyle(container)
        const gap = parseInt(computedStyle.getPropertyValue('gap') || '0', 10)

        dimensionsRef.current.itemWidth = itemRect.width + gap

        // Centrer la première carte
        const leftOffset = (containerClientWidth - itemRect.width) / 2

        // Appliquer les marges pour la première et dernière carte
        const items = container.querySelectorAll(`.${styles.carouselItem}`)
        if (items.length > 0) {
          items[0].style.marginLeft = `${leftOffset}px`
          items[items.length - 1].style.marginRight = `${leftOffset}px`
        }
      }
    }

    // Exécuter immédiatement et après un court délai pour s'assurer que tout est rendu
    updateDimensions()
    const timeoutId = setTimeout(updateDimensions, 100)

    // Ajouter l'écouteur de redimensionnement
    window.addEventListener('resize', updateDimensions)

    // Nettoyage
    return () => {
      window.removeEventListener('resize', updateDimensions)
      clearTimeout(timeoutId)
    }
  }, [cards.length])

  // Debounce pour l'update de l'index
  const debouncedUpdateFocusedIndex = useDebounce(updateFocusedIndex, 50)

  // Écouteur de scroll principal
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onScroll = () => {
      if (!isProgrammaticScroll.current) {
        debouncedUpdateFocusedIndex()
      } else {
        isProgrammaticScroll.current = false
      }
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [debouncedUpdateFocusedIndex])

  // Fonction pour faire défiler vers une carte spécifique
  const scrollToCard = useCallback(
    (index) => {
      const container = containerRef.current
      if (!container || cards.length === 0) return

      // Limiter l'index entre 0 et le nombre de cartes - 1
      const clampedIndex = Math.max(0, Math.min(index, cards.length - 1))

      isProgrammaticScroll.current = true

      // Calculer la position pour le scroll
      const items = container.querySelectorAll(`.${styles.carouselItem}`)
      if (items.length > 0 && items[clampedIndex]) {
        const item = items[clampedIndex]
        const itemRect = item.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        // Calculer le défilement nécessaire pour centrer l'élément
        const scrollNeeded =
          item.offsetLeft - (containerRect.width - itemRect.width) / 2

        container.scrollTo({
          left: scrollNeeded,
          behavior: 'smooth',
        })

        // Mettre à jour l'index directement
        setFocusedIndex(clampedIndex)
      }
    },
    [cards.length]
  )

  // Navigation clavier
  const handleKeyDown = useCallback(
    (e) => {
      let newIndex = focusedIndex

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        newIndex = Math.max(0, focusedIndex - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        newIndex = Math.min(cards.length - 1, focusedIndex + 1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        newIndex = 0
      } else if (e.key === 'End') {
        e.preventDefault()
        newIndex = cards.length - 1
      }

      if (newIndex !== focusedIndex) {
        scrollToCard(newIndex)
      }
    },
    [cards.length, focusedIndex, scrollToCard]
  )

  // Gestion du glisser-déposer
  const onMouseDown = useCallback((e) => {
    const container = containerRef.current
    if (!container) return
    setIsDragging(true)
    setStartX(e.pageX - container.offsetLeft)
    setScrollLeft(container.scrollLeft)
  }, [])

  const stopDrag = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      // Actualiser l'index de focus après avoir arrêté de faire glisser
      updateFocusedIndex()
    }
  }, [isDragging, updateFocusedIndex])

  const onMouseMove = useCallback(
    (e) => {
      if (!isDragging) return
      const container = containerRef.current
      if (!container) return

      e.preventDefault()
      const x = e.pageX - container.offsetLeft
      const walk = (x - startX) * 1.5
      container.scrollLeft = scrollLeft - walk
    },
    [isDragging, startX, scrollLeft]
  )

  // Gestion tactile
  const [touchStart, setTouchStart] = useState(0)

  const onTouchStart = useCallback((e) => {
    if (e.touches && e.touches.length > 0) {
      setTouchStart(e.touches[0].pageX)
    }
  }, [])

  const onTouchMove = useCallback(
    (e) => {
      if (!e.touches || e.touches.length === 0) return

      const container = containerRef.current
      if (!container || touchStart === 0) return

      const x = e.touches[0].pageX
      const walk = (touchStart - x) * 2
      container.scrollLeft += walk
      setTouchStart(x)
    },
    [touchStart]
  )

  const onTouchEnd = useCallback(() => {
    if (touchStart !== 0) {
      setTouchStart(0)
      updateFocusedIndex()
    }
  }, [touchStart, updateFocusedIndex])

  // Gestion de la molette de la souris
  useEffect(() => {
    const onWheel = (e) => {
      const container = containerRef.current
      if (!container) return

      if (e.deltaY !== 0) {
        e.preventDefault()
        container.scrollLeft += e.deltaY * 40
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', onWheel, { passive: false })
      return () => {
        container.removeEventListener('wheel', onWheel)
      }
    }
  }, [])

  // Mettre à jour l'index au changement de cartes
  useEffect(() => {
    // Délai pour laisser le temps au DOM de se mettre à jour
    const timeoutId = setTimeout(() => {
      updateFocusedIndex()
    }, 150)

    return () => clearTimeout(timeoutId)
  }, [cards, updateFocusedIndex])

  return (
    <div
      className={styles.carouselWrapper}
      role="region"
      aria-label="Carrousel de projets"
      aria-live="polite"
    >
      <div
        ref={containerRef}
        className={`${styles.carouselContainer} allowScroll`}
        role="tablist"
        aria-label={`${cards.length} projets disponibles`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseDown={onMouseDown}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: 'pan-x' }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            className={styles.carouselItem}
            role="tab"
            aria-selected={index === focusedIndex}
            aria-label={`Projet ${index + 1} sur ${cards.length}`}
            tabIndex={index === focusedIndex ? 0 : -1}
          >
            {card}
          </div>
        ))}
      </div>

      <div className={styles.carouselIndicator} aria-hidden="true">
        {cards.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${
              index === focusedIndex ? styles.active : ''
            }`}
            onClick={() => scrollToCard(index)}
            aria-label={`Aller au projet ${index + 1}`}
          />
        ))}
      </div>

      <div className="sr-only">
        Utilisez les flèches gauche et droite pour naviguer entre les projets,
        ou Début/Fin pour aller au premier/dernier projet.
      </div>
    </div>
  )
}
