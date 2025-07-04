// Contact.jsx - Version optimisée
import {
  useEffect,
  useState,
  useContext,
  useMemo,
  useCallback,
  memo,
} from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './contact.module.scss'
import ArrowUp from '../../components/navigationArrows/ArrowUp'
import ContactGame from '../../components/contactGame/ContactGame'
import PhoneGame from '../../components/phoneGame/PhoneGame'
import Footer from '../../components/footer/Footer'
import AlternatingContactLogo from '../../components/alternatingContactLogo/AlternatingContactLogo'

// Composant Logo défini en dehors et mémorisé
const Logo = memo(({ type, position, onClick, isMobile }) => {
  const labels = {
    linkedin: 'Ouvrir le profil LinkedIn',
    github: 'Ouvrir le profil GitHub',
  }

  const getSvgIcon = (type) => {
    const commonProps = {
      width: isMobile ? '30' : '40',
      height: isMobile ? '30' : '40',
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      className: styles.logoSvg,
      'aria-hidden': 'true',
    }

    switch (type) {
      case 'linkedin':
        return (
          <svg {...commonProps}>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        )
      case 'github':
        return (
          <svg {...commonProps}>
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={styles.staticLogo}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: 'pointer',
        zIndex: 1000,
      }}
      onClick={() => onClick(type)}
      role="button"
      tabIndex="0"
      aria-label={labels[type]}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(type)
        }
      }}
    >
      {getSvgIcon(type)}
    </div>
  )
})

Logo.displayName = 'Logo'

// Composant pour grouper tous les logos statiques
const StaticLogos = memo(
  ({ activeGame, staticPositions, handleLogoClick, isMobile }) => {
    if (activeGame) return null

    return (
      <>
        <Logo
          type="linkedin"
          position={staticPositions.linkedin}
          onClick={handleLogoClick}
          isMobile={isMobile}
        />
        <Logo
          type="github"
          position={staticPositions.github}
          onClick={handleLogoClick}
          isMobile={isMobile}
        />
        <AlternatingContactLogo
          position={staticPositions.phone}
          onClick={() => handleLogoClick('phone')}
          isMobile={isMobile}
        />
      </>
    )
  }
)

StaticLogos.displayName = 'StaticLogos'

// Composant Contact principal
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
        // Masquer automatiquement après 5 secondes
        setTimeout(() => {
          setShowPhoneNumber(false)
        }, 5000)
      },
    }

    actions[type]?.()
  }, [])

  // Composant de menu de sélection
  const GameMenu = () => (
    <div className={styles.gameMenu}>
      <h2>Mon contact</h2>
      <ul>
        <li>
          <strong>Mode simple :</strong> Cliquez directement sur les logos en
          bas à droite
        </li>
        <li>
          <strong>Mode jeu :</strong> Réussissez les deux jeux pour accéder à
          mes infos !
        </li>
      </ul>
      <div className={styles.gameButtons}>
        <div className={styles.gameCard}>
          <h3>La chasse aux profils</h3>
          <p>
            Guidez un logo dans une zone pour ouvrir un lien vers mon profil
            LinkedIn ou GitHub.
          </p>
          <button
            onClick={() => startGame('contact')}
            className={styles.gameButton}
          >
            C'est parti !
          </button>
        </div>

        <div className={styles.gameCard}>
          <h3>Séquence Mécanique</h3>
          <p>
            Placez les 3 roues dans le bon ordre pour révéler mon numéro de
            téléphone.
          </p>
          <button
            onClick={() => startGame('phone')}
            className={styles.gameButton}
          >
            C'est parti !
          </button>
        </div>
      </div>
    </div>
  )

  // Composant de jeu en plein écran
  const FullscreenGame = ({ gameType }) => (
    <div className={styles.fullGame}>
      <button onClick={backToMenu} className={styles.backButton}>
        ← Retour
      </button>
      {gameType === 'contact' && <ContactGame />}
      {gameType === 'phone' && <PhoneGame backButton={backToMenu} />}
    </div>
  )

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
        {!activeGame && <GameMenu />}
        {activeGame && <FullscreenGame gameType={activeGame} />}

        {/* Logos statiques (toujours visibles sauf en mode jeu) */}
        <StaticLogos
          activeGame={activeGame}
          staticPositions={staticPositions}
          handleLogoClick={handleLogoClick}
          isMobile={isMobile}
        />

        {/* Affichage du numéro de téléphone et email */}
        {showPhoneNumber && (
          <div className={styles.phoneDisplay}>
            <div className={styles.phoneModal}>
              <div className={styles.phoneContent}>
                <h3>📱 Mes coordonnées</h3>
                <p className={styles.phoneNumber}>📞 06 12 34 56 78</p>
                <p className={styles.phoneNumber}>
                  ✉️ romain.calmelet@email.com
                </p>
                <button
                  onClick={() => setShowPhoneNumber(false)}
                  className={styles.closeButton}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Contact
