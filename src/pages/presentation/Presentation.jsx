import { useEffect, useState, useContext, lazy, Suspense } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './presentation.module.scss'
import ArrowUp from '../../components/navigationArrows/ArrowUp'
import ArrowDown from '../../components/navigationArrows/ArrowDown'
import FallbackPortrait from '../../components/fallbackPortrait/FallbackPortrait'
import portraitDesktop from '../../assets/img/portraitRC/portraitDesktop.webp'
import portraitTablet from '../../assets/img/portraitRC/portraitTablet.webp'
import portraitMobile from '../../assets/img/portraitRC/portraitMobile.webp'
import BackgroundPresentation from '../../components/backgroundPresentation/BackgroundPresentation'

// Lazy loading pour AutoCarousel
const AutoCarousel = lazy(() =>
  import('../../components/autoCarousel/AutoCarousel')
)

function Presentation() {
  const [isVisible, setIsVisible] = useState(false)
  const [imageErrorMobile, setImageErrorMobile] = useState(false)
  const [imageErrorDesktop, setImageErrorDesktop] = useState(false)
  const { direction, resetNavigation } = useContext(NavigationContext)

  useEffect(() => {
    resetNavigation?.()
    setIsVisible(true)

    return () => {
      setIsVisible(false)
    }
  }, [resetNavigation])

  // Gestionnaires d'erreur séparés pour mobile et desktop
  const handleMobileImageError = () => {
    setImageErrorMobile(true)
    console.error("Erreur lors du chargement de l'image portrait mobile")
  }

  const handleDesktopImageError = () => {
    setImageErrorDesktop(true)
    console.error("Erreur lors du chargement de l'image portrait desktop")
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
        <div className={styles.navUp}>
          <ArrowUp aria-label="Naviguer vers la section précédente" />
        </div>

        <article className={styles.aboutMe} aria-labelledby="about-title">
          <div className={styles.text}>
            <header>
              <h1 id="about-title">Quelques mots sur moi</h1>
            </header>

            <section
              className={styles.contentSection}
              aria-label="Présentation personnelle"
            >
              {/* Image flottante pour mobile - Simplifiée */}
              <div className={styles.floatingImage}>
                {imageErrorMobile ? (
                  <FallbackPortrait className={styles.fallbackMobile} />
                ) : (
                  <img
                    src={portraitMobile}
                    alt="Portrait de Romain Calmelet"
                    loading="lazy"
                    onError={handleMobileImageError}
                  />
                )}
              </div>

              <div className={styles.paragraphs}>
                <p>
                  Après dix années passées dans l'horlogerie, où précision,
                  rigueur et sens du détail faisaient partie de mon quotidien,
                  j'ai décidé de relever un nouveau défi&nbsp;:
                  le&nbsp;développement&nbsp;web.
                </p>
                <p>
                  Ce domaine me passionne par la diversité de ses tâches et
                  l'infinité de ses possibilités. On peut établir de nombreux
                  parallèles entre la mécanique horlogère et celle du code, et
                  je prends plaisir chaque jour à imaginer et inventer de
                  nouveaux mécanismes virtuels.
                </p>
                <p>
                  Je suis plus motivé que jamais à évoluer dans cet univers, et
                  à y apporter ma sensibilité artisanale acquise au long de mon
                  parcours.
                </p>
              </div>
            </section>

            <Suspense
              fallback={
                <div className={styles.carouselLoader}>
                  <span>Chargement...</span>
                </div>
              }
            >
              <AutoCarousel />
            </Suspense>
          </div>

          {/* Image pour desktop - Avec sources multiples */}
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
                  alt="Portrait de Romain Calmelet"
                  loading="lazy"
                  onError={handleDesktopImageError}
                />
              </picture>
            )}
          </aside>
        </article>

        <nav className={styles.navDown} aria-label="Navigation entre sections">
          <ArrowDown aria-label="Naviguer vers la section suivante" />
        </nav>
      </main>
    </div>
  )
}

export default Presentation
