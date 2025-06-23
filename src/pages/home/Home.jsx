import { useEffect, useState, useContext } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './home.module.scss'
import GeometricBackgroundHome from '../../components/geometricBackgroundHome/GeometricBackgroundHome'
import ArrowDown from '../../components/navigationArrows/ArrowDown'
import TextIntro from '../../components/textIntro/TextIntro'
import { useMediaQuery } from 'react-responsive'

function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const { direction } = useContext(NavigationContext)
  const isMobileNav = useMediaQuery({ query: '(max-width: 768px)' })

  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  return (
    <>
      <div
        className={`page-container ${
          isVisible
            ? direction === 'down'
              ? 'page-enter-down'
              : 'page-enter-up'
            : ''
        }`}
      >
        <GeometricBackgroundHome />
        <div className={styles.container}>
          <div className={styles.intro}>
            <h2>Salut !</h2>
            <TextIntro />
          </div>
          <div className={styles.nav}>
            {isMobileNav ? (
              <p>
                Swiper ou utiliser les boutons de navigation pour changer de
                page.
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
    </>
  )
}

export default Home
