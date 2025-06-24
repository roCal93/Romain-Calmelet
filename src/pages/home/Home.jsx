import { useEffect, useState, useContext } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './home.module.scss'
import GeometricBackgroundHome from '../../components/geometricBackgroundHome/GeometricBackgroundHome'
import ArrowDown from '../../components/navigationArrows/ArrowDown'
import TextIntro from '../../components/textIntro/TextIntro'

function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const { direction } = useContext(NavigationContext)

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
            <ArrowDown />
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
