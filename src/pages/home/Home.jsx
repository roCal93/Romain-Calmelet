import { useEffect, useState, useContext } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './home.module.scss'
import BackgroundHome from '../../components/backgroundHome/BackgroundHome'
import ArrowDown from '../../components/navigationArrows/ArrowDown'
import TextIntro from '../../components/textIntro/TextIntro'

function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [title, setTitle] = useState('Salut !')
  const { direction } = useContext(NavigationContext)

  useEffect(() => {
    // Déclencher l'animation après le montage
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 10) // Petit délai pour assurer le rendu initial

    return () => clearTimeout(timer)
  }, [])

  const handleTitleChange = () => {
    setTitle('Bonjour,')
    if (title == 'Bonjour,') {
      setTitle('Salut !')
    }
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
      <BackgroundHome />
      <div className={styles.container}>
        <div className={styles.intro}>
          <h2>{title}</h2>
          <TextIntro />
        </div>
        <div className={styles.nav}>
          <ArrowDown />
        </div>
        <aside>
          <button onClick={handleTitleChange} className={styles.button}>
            {title === 'Bonjour,' ? 'Je suis chill' : 'Je suis important'}
          </button>
        </aside>
      </div>
    </div>
  )
}

export default Home
