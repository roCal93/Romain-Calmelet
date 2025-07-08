import { useEffect, useState, useContext } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './presentation.module.scss'
import ArrowUp from '../../components/navigationArrows/ArrowUp'
import ArrowDown from '../../components/navigationArrows/ArrowDown'
import AutoCarousel from '../../components/autoCarousel/AutoCarousel'
import portraitDesktop from '../../assets/img/portraitRC/portraitDesktop.webp'
import portraitTablet from '../../assets/img/portraitRC/portraitTablet.webp'
import portraitMobile from '../../assets/img/portraitRC/portraitMobile.webp'
import BackgroundPresentation from '../../components/backgroundPresentation/BackgroundPresentation'

function Presentation() {
  const [isVisible, setIsVisible] = useState(false)
  const { direction, resetNavigation } = useContext(NavigationContext)

  useEffect(() => {
    resetNavigation?.() // Forcer le reset
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [resetNavigation])

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
      <div className={styles.container}>
        <ArrowUp />
        <div className={styles.aboutMe}>
          <div className={styles.text}>
            <h1>Quelques mots sur moi </h1>
            <section className={styles.contentSection}>
              <picture className={styles.floatingImage}>
                <source srcSet={portraitMobile} media="(max-width: 480px)" />
                <source srcSet={portraitTablet} media="(max-width: 768px)" />
                <img src={portraitDesktop} alt="Portrait de Romain Calmelet" />
              </picture>
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
            <AutoCarousel />
          </div>
          <picture className={styles.desktopImage}>
            <source srcSet={portraitDesktop} media="(min-width: 769px)" />
            <img
              className={styles.img}
              src={portraitDesktop}
              alt="Portrait de Romain Calmelet"
            />
          </picture>
        </div>
        <div className={styles.nav}>
          <ArrowDown />
        </div>
      </div>
    </div>
  )
}

export default Presentation
