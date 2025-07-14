// NotFound.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './notFound.module.scss'

const NotFound = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  return (
    <>
      <title>Romain Calmelet - Page Introuvable</title>
      <div
        className={`${styles.pageContainer} ${isVisible ? styles.visible : ''}`}
      >
        <main className={styles.container} role="main">
          <article
            className={styles.notFoundContent}
            aria-labelledby="error-title"
          >
            <div className={styles.errorSection}>
              <header>
                <h1 id="error-title" className={styles.errorCode}>
                  404
                </h1>
                <h2 className={styles.errorMessage}>Page introuvable</h2>
              </header>

              <section className={styles.contentSection}>
                <div className={styles.paragraphs}>
                  <p>
                    Comme un mécanisme horloger déréglé, cette page semble avoir
                    disparu dans les rouages du temps numérique.
                  </p>
                  <p>
                    Mais pas d'inquiétude, je peux vous aider à retrouver votre
                    chemin.
                  </p>
                </div>

                <Link to="/" className={styles.homeLink}>
                  <span className={styles.linkText}>Retour à l'accueil</span>
                  <span className={styles.linkArrow}>→</span>
                </Link>
              </section>
            </div>

            <aside className={styles.decorativeGears} aria-hidden="true">
              <div className={styles.gear1}></div>
              <div className={styles.gear2}></div>
              <div className={styles.gear3}></div>
            </aside>
          </article>
        </main>
      </div>
    </>
  )
}

export default NotFound
