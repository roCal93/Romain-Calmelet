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
  const [isTouching, setIsTouching] = useState(false)

  // Stocker les dimensions dans des refs
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

    // Exécuter immédiatement et après un court délai
    updateDimensions()
    const timeoutId = setTimeout(updateDimensions, 100)

    // Orientation change pour mobiles
    const handleOrientationChange = () => {
      setTimeout(updateDimensions, 200) // Délai pour laisser l'orientation se stabiliser
    }

    window.addEventListener('resize', updateDimensions)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', updateDimensions)
      window.removeEventListener('orientationchange', handleOrientationChange)
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
      if (!isProgrammaticScroll.current && !isTouching) {
        debouncedUpdateFocusedIndex()
      } else if (isProgrammaticScroll.current) {
        isProgrammaticScroll.current = false
      }
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [debouncedUpdateFocusedIndex, isTouching])

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

  // Gestion du glisser-déposer (souris)
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
      setTimeout(updateFocusedIndex, 100) // Petit délai pour laisser le scroll se stabiliser
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

  // ---- GESTION TACTILE AMÉLIORÉE ----
  // Utiliser des refs pour stocker les informations de toucher
  const touchInfoRef = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    initialScrollLeft: 0,
    lastX: 0,
    isScrolling: false,
    touchIdentifier: null,
  })

  const onTouchStart = useCallback((e) => {
    const container = containerRef.current
    if (!container || !e.touches || e.touches.length === 0) return

    const touch = e.touches[0]
    touchInfoRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      initialScrollLeft: container.scrollLeft,
      lastX: touch.clientX,
      isScrolling: false,
      touchIdentifier: touch.identifier,
    }

    setIsTouching(true)
  }, [])

  const onTouchMove = useCallback(
    (e) => {
      const container = containerRef.current
      if (!container || !e.touches || e.touches.length === 0 || !isTouching)
        return

      // Trouver le bon toucher en utilisant l'identifiant
      let touchIndex = -1
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === touchInfoRef.current.touchIdentifier) {
          touchIndex = i
          break
        }
      }

      if (touchIndex === -1) return // Le toucher n'existe plus
      const touch = e.touches[touchIndex]

      // Calculer le delta X et Y depuis le début du toucher
      const deltaX = touchInfoRef.current.startX - touch.clientX
      const deltaY = touchInfoRef.current.startY - touch.clientY

      // Si c'est le début du mouvement, déterminer si l'utilisateur veut défiler horizontalement ou verticalement
      if (
        !touchInfoRef.current.isScrolling &&
        (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)
      ) {
        // Si le défilement horizontal est plus important, empêcher le défilement vertical de la page
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          touchInfoRef.current.isScrolling = true
          e.preventDefault() // Empêcher le défilement vertical
        } else {
          // Laisser le défilement vertical se produire naturellement
          return
        }
      }

      // Si nous avons déterminé qu'il s'agit d'un défilement horizontal
      if (touchInfoRef.current.isScrolling) {
        // Calculer la distance depuis le dernier événement de toucher
        const moveDelta = touch.clientX - touchInfoRef.current.lastX
        container.scrollLeft -= moveDelta
        touchInfoRef.current.lastX = touch.clientX
      }
    },
    [isTouching]
  )

  const onTouchEnd = useCallback(() => {
    if (!isTouching) return

    const container = containerRef.current
    if (!container) {
      setIsTouching(false)
      return
    }

    // Calculer la vitesse du geste pour éventuellement ajouter un effet d'inertie
    const touchDuration = Date.now() - touchInfoRef.current.startTime
    const distance =
      touchInfoRef.current.initialScrollLeft - container.scrollLeft

    // Geste de swipe rapide (moins de 300ms)
    if (touchDuration < 300 && Math.abs(distance) > 50) {
      // Déterminer la direction du swipe
      const direction = distance > 0 ? 1 : -1

      // Swipe à droite = carte précédente, swipe à gauche = carte suivante
      const targetIndex = Math.max(
        0,
        Math.min(focusedIndex - direction, cards.length - 1)
      )

      if (targetIndex !== focusedIndex) {
        // Utiliser scrollToCard pour un mouvement fluide
        scrollToCard(targetIndex)
      } else {
        // Si nous sommes déjà à la première ou dernière carte, ajuster le scroll
        updateFocusedIndex()
      }
    } else {
      // Pour les mouvements plus lents, snapper à la carte la plus proche
      setTimeout(updateFocusedIndex, 50)
    }

    setIsTouching(false)
    touchInfoRef.current.isScrolling = false
    touchInfoRef.current.touchIdentifier = null
  }, [isTouching, focusedIndex, cards.length, scrollToCard, updateFocusedIndex])

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
        onTouchCancel={onTouchEnd}
        style={{
          touchAction: 'pan-y', // Permettre le défilement vertical mais pas horizontal
          WebkitOverflowScrolling: 'touch', // Pour une meilleure inertie sur iOS
        }}
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
