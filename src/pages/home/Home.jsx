import { useEffect, useState, useContext, useCallback, useMemo } from 'react'
import { NavigationContext } from '../../contexts/NavigationContext'
import styles from './home.module.scss'
import BackgroundHome from '../../components/backgroundHome/BackgroundHome'
import ArrowDown from '../../components/navigationArrows/ArrowDown'
import TextIntro from '../../components/textIntro/TextIntro'
import LanguageSwitcher from '../../components/languageSwitcher/LanguageSwitcher'
import { useTranslation } from '../../hooks/useTranslation'

function Home() {
  const { t, language } = useTranslation()

  //  Déplacer TITLES dans useMemo pour qu'il se mette à jour avec la langue
  const TITLES = useMemo(
    () => ({
      CASUAL: t('home.title'),
      FORMAL: 'Bonjour,',
    }),
    [t]
  )

  const [isVisible, setIsVisible] = useState(false)
  const [title, setTitle] = useState(TITLES.CASUAL)
  const { direction } = useContext(NavigationContext)

  // ✅ Mettre à jour le titre quand la langue change
  useEffect(() => {
    setTitle(TITLES.CASUAL)
  }, [TITLES.CASUAL])

  useEffect(() => {
    // Trigger entrance animation after component mount
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 10) // Small delay to ensure initial render

    return () => clearTimeout(timer)
  }, [])

  // Toggle between casual and formal greeting
  const handleTitleChange = useCallback(() => {
    setTitle((prevTitle) =>
      prevTitle === TITLES.CASUAL ? TITLES.FORMAL : TITLES.CASUAL
    )
  }, [TITLES.CASUAL, TITLES.FORMAL])

  // Get button text based on current title
  const getButtonText = () => {
    return title === TITLES.FORMAL ? 'Je suis chill' : 'Je suis important'
  }

  // Get aria-label for accessibility
  const getButtonAriaLabel = () => {
    return `Changer le message pour ${
      title === TITLES.CASUAL ? 'Bonjour' : 'Salut'
    }`
  }

  // Déterminer si le bouton doit être affiché (seulement en français)
  const shouldShowButton = language === 'fr'

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
      <BackgroundHome />
      <div className={styles.container}>
        {/* Main content section */}
        <div className={styles.intro}>
          <h2>{title}</h2>
          <TextIntro />
        </div>

        {/* Navigation section */}
        <nav className={styles.nav} aria-label="Navigation principale">
          <ArrowDown />
        </nav>

        {/* Action buttons section - conditionnel selon la langue */}
        {shouldShowButton && (
          <div className={styles.actions}>
            <button
              onClick={handleTitleChange}
              className={styles.button}
              aria-label={getButtonAriaLabel()}
              type="button"
              tabIndex={0}
            >
              <span aria-hidden="true">{getButtonText()}</span>
            </button>
          </div>
        )}

        <LanguageSwitcher />
      </div>
    </div>
  )
}

export default Home
