import { useEffect, useState, useContext } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './presentation.module.scss'
import ArrowUp from '../../components/navigationArrows/ArrowUp'
import ArrowDown from '../../components/navigationArrows/ArrowDown'
import AutoCarousel from '../../components/autoCarousel/AutoCarousel'
import { useMediaQuery } from 'react-responsive'
import portraitDesktop from '../../assets/img/portraitDesktop.jpeg'
import portraitTablet from '../../assets/img/portraitTablet.jpeg'
import portraitMobile from '../../assets/img/portraitMobile.jpeg'
import BackgroundPresentation from '../../components/backgroundPresentation/BackgroundPresentation'

function Presentation() {
  const [isVisible, setIsVisible] = useState(false)
  const { direction } = useContext(NavigationContext)
  const isMobileNav = useMediaQuery({ query: '(max-width: 768px)' })

  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

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
        <div className={styles.aboutMe}>
          <div className={styles.text}>
            <h1>Quelques mots sur moi </h1>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime in
              non quo possimus, suscipit numquam maiores aut neque fugiat
              deserunt nisi officiis sapiente voluptate beatae facere atque illo
              totam eveniet! Lorem ipsum dolor sit amet consectetur adipisicing
              elit. Maxime in non quo possimus, suscipit numquam maiores aut
              neque fugiat deserunt nisi officiis sapiente voluptate beatae
              facere atque illo totam eveniet! Lorem ipsum dolor sit amet
              consectetur adipisicing elit. Maxime in non quo possimus, suscipit
              numquam maiores aut neque fugiat deserunt nisi officiis sapiente
              voluptate beatae facere atque illo totam eveniet! Lorem ipsum
              dolor sit amet consectetur adipisicing elit. Maxime in non quo
              possimus, suscipit numquam maiores aut neque fugiat deserunt nisi
              officiis sapiente voluptate beatae facere atque illo totam
              eveniet! Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Maxime in non quo possimus, suscipit numquam maiores aut neque
              fugiat deserunt nisi officiis sapiente voluptate beatae facere
              atque illo totam eveniet! Lorem ipsum dolor sit amet consectetur
              adipisicing elit. Maxime in non quo possimus, suscipit numquam
              maiores aut neque fugiat deserunt nisi officiis sapiente voluptate
              beatae facere atque illo totam eveniet! Lorem ipsum dolor sit amet
              consectetur adipisicing elit. Maxime in non quo possimus, suscipit
              numquam maiores aut neque fugiat deserunt nisi officiis sapiente
              voluptate beatae facere atque illo totam eveniet!
            </p>
            <AutoCarousel />
          </div>
          <ArrowUp />
          <picture>
            <source srcSet={portraitMobile} media="(max-width: 480px)" />
            <source srcSet={portraitDesktop} media="(min-width: 1200px)" />
            <img
              className={styles.img}
              src={portraitTablet}
              alt="A tree representing banking services at Argent Bank"
            />
          </picture>
        </div>
        <div className={styles.nav}>
          {isMobileNav ? (
            <p>
              Swiper ou utiliser les boutons de navigation pour changer de page.
            </p>
          ) : (
            <p>
              Utiliser la molette de la souris, le clavier ou les boutons de
              navigation pour changer de page.
            </p>
          )}
          <ArrowDown />
        </div>
      </div>
    </div>
  )
}

export default Presentation
