import {
  useEffect,
  useState,
  useContext,
  lazy,
  Suspense,
  useCallback,
} from 'react'
import { NavigationContext } from '../../contexts/NavigationContext'
import styles from './presentation.module.scss'
import ArrowUp from '../../components/navigationArrows/ArrowUp'
import ArrowDown from '../../components/navigationArrows/ArrowDown'
import FallbackPortrait from '../../components/fallbackPortrait/FallbackPortrait'
import portraitDesktop from '../../assets/img/portraitRC/portraitDesktop.webp'
import portraitTablet from '../../assets/img/portraitRC/portraitTablet.webp'
import portraitMobile from '../../assets/img/portraitRC/portraitMobile.webp'
import BackgroundPresentation from '../../components/backgroundPresentation/BackgroundPresentation'
import { useTranslation } from '../../hooks/useTranslation'

// Lazy loading for AutoCarousel component
const AutoCarousel = lazy(() =>
  import('../../components/autoCarousel/AutoCarousel')
)

function Presentation() {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [imageErrorMobile, setImageErrorMobile] = useState(false)
  const [imageErrorDesktop, setImageErrorDesktop] = useState(false)

  // Context optimization with useCallback to prevent unnecessary re-renders
  const { direction, resetNavigation } = useContext(NavigationContext)
  const memoizedResetNavigation = useCallback(() => {
    resetNavigation?.()
  }, [resetNavigation])

  useEffect(() => {
    // Reset navigation state and trigger visibility
    memoizedResetNavigation()
    setIsVisible(true)

    // Preload critical images based on viewport width
    const criticalImage =
      window.innerWidth > 768 ? portraitDesktop : portraitMobile
    const link = document.createElement('link')
    link.as = 'image'
    link.href = criticalImage
    link.type = 'image/webp'
    document.head.appendChild(link)

    // Cleanup functions
    return () => {
      setIsVisible(false)
      // Remove preload link when component unmounts
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [memoizedResetNavigation])

  // Separate error handlers for mobile and desktop images
  const handleMobileImageError = () => {
    setImageErrorMobile(true)
    console.error('Error loading mobile portrait image')
  }

  const handleDesktopImageError = () => {
    setImageErrorDesktop(true)
    console.error('Error loading desktop portrait image')
  }

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
      <BackgroundPresentation />

      <main className={styles.container} role="main">
        {/* Top navigation arrow */}
        <div className={styles.navUp}>
          <ArrowUp aria-label="Navigate to previous section" />
        </div>

        <article className={styles.aboutMe} aria-labelledby="about-title">
          <div className={styles.text}>
            <header>
              <h1 id="about-title">{t('introduction.title')}</h1>
            </header>

            <section
              className={styles.contentSection}
              aria-label="Personal presentation"
            >
              {/* Floating image for mobile - Simplified version */}
              <div className={styles.floatingImage}>
                {imageErrorMobile ? (
                  <FallbackPortrait className={styles.fallbackMobile} />
                ) : (
                  <img
                    src={portraitMobile}
                    alt="Portrait of Romain Calmelet"
                    onError={handleMobileImageError}
                    width="300"
                    height="300"
                  />
                )}
              </div>

              <div className={styles.paragraphs}>
                <p>{t('introduction.text1')}</p>
                <p>{t('introduction.text2')}</p>
                <p>{t('introduction.text3')}</p>
              </div>
            </section>

            {/* Lazy loaded carousel with fallback */}
            <Suspense
              fallback={
                <div className={styles.carouselLoader}>
                  <span>Loading content...</span>
                </div>
              }
            >
              <AutoCarousel />
            </Suspense>
          </div>

          {/* Desktop image with multiple sources */}
          <aside className={styles.desktopImage} aria-label="Portrait">
            {imageErrorDesktop ? (
              <FallbackPortrait className={styles.fallbackDesktop} />
            ) : (
              <picture>
                <source
                  srcSet={portraitDesktop}
                  media="(min-width: 1200px)"
                  type="image/webp"
                />
                <source
                  srcSet={portraitTablet}
                  media="(min-width: 768px)"
                  type="image/webp"
                />
                <img
                  className={styles.img}
                  src={portraitTablet}
                  alt="Portrait of Romain Calmelet"
                  onError={handleDesktopImageError}
                  width="400"
                  height="533"
                />
              </picture>
            )}
          </aside>
        </article>

        {/* Bottom navigation arrow */}
        <nav className={styles.navDown} aria-label="Section navigation">
          <ArrowDown aria-label="Navigate to next section" />
        </nav>
      </main>
    </div>
  )
}

export default Presentation
