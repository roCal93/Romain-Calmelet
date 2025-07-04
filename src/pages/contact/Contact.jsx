import { useEffect, useState, useContext, useMemo, useCallback } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './contact.module.scss'
import ArrowUp from '../../components/navigationArrows/ArrowUp'
import Footer from '../../components/footer/Footer'
import StaticLogos from '../../components/StaticLogos/StaticLogos'
import GameMenu from '../../components/GameMenu/GameMenu'
import FullscreenGame from '../../components/FullscreenGame/FullscreenGame'
import PhoneDisplay from '../../components/PhoneDisplay/PhoneDisplay'

function Contact() {
  // États
  const [isVisible, setIsVisible] = useState(false)
  const [activeGame, setActiveGame] = useState(null)
  const [showPhoneNumber, setShowPhoneNumber] = useState(false)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  const { direction } = useContext(NavigationContext)

  const isMobile = windowSize.width <= 768

  // Debounce pour le resize
  const debounce = useCallback((func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }, [])

  // Positions des logos avec toutes les dépendances
  const staticPositions = useMemo(
    () => ({
      linkedin: {
        x: isMobile ? windowSize.width - 50 : windowSize.width - 110,
        y: isMobile ? windowSize.height - 340 : windowSize.height - 460,
      },
      github: {
        x: isMobile ? windowSize.width - 50 : windowSize.width - 110,
        y: isMobile ? windowSize.height - 260 : windowSize.height - 360,
      },
      phone: {
        x: isMobile ? windowSize.width - 50 : windowSize.width - 110,
        y: isMobile ? windowSize.height - 180 : windowSize.height - 260,
      },
    }),
    [isMobile, windowSize.width, windowSize.height]
  )

  // Effets
  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  useEffect(() => {
    const handleResize = debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }, 100)

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [debounce])

  // Fonctions
  const startGame = useCallback((gameType) => {
    setActiveGame(gameType)
  }, [])

  const backToMenu = useCallback(() => {
    setActiveGame(null)
  }, [])

  const handleLogoClick = useCallback((type) => {
    const actions = {
      linkedin: () =>
        window.open(
          'https://www.linkedin.com/in/romain-calmelet/',
          '_blank',
          'noopener,noreferrer'
        ),
      github: () =>
        window.open(
          'https://github.com/RoCal93',
          '_blank',
          'noopener,noreferrer'
        ),
      phone: () => {
        setShowPhoneNumber(true)
      },
    }

    actions[type]?.()
  }, [])

  // Rendu principal
  return (
    <div
      className={`page-container ${
        isVisible
          ? direction === 'down'
            ? 'page-enter-down'
            : 'page-enter-up'
          : ''
      }`}
    >
      <div className={styles.container}>
        {!activeGame && <ArrowUp />}
        {!activeGame && <GameMenu startGame={startGame} />}
        {activeGame && (
          <FullscreenGame gameType={activeGame} backToMenu={backToMenu} />
        )}

        {/* Logos statiques (toujours visibles sauf en mode jeu) */}
        <StaticLogos
          activeGame={activeGame}
          staticPositions={staticPositions}
          handleLogoClick={handleLogoClick}
          isMobile={isMobile}
        />

        {/* Affichage du numéro de téléphone et email */}
        <PhoneDisplay
          showPhoneNumber={showPhoneNumber}
          setShowPhoneNumber={setShowPhoneNumber}
        />
      </div>
      <Footer />
    </div>
  )
}

export default Contact
