// NotFound.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'
import styles from './notFound.module.scss'

const NotFound = () => {
  const { t } = useTranslation()
  // State to control fade-in animation on component mount
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger visibility animation after component mounts
    setIsVisible(true)
    // Cleanup function to reset visibility state on unmount
    return () => setIsVisible(false)
  }, [])

  return (
    <>
      {/* Dynamic page title for SEO and browser tab */}
      <title>{t('notFound.title')}</title>

      {/* Main page container with conditional visibility class */}
      <div
        className={`${styles.pageContainer} ${isVisible ? styles.visible : ''}`}
      >
        {/* Semantic main element for screen readers */}
        <main className={styles.container} role="main">
          {/* Article wrapper for 404 content with proper ARIA labeling */}
          <article
            className={styles.notFoundContent}
            aria-labelledby="error-title"
          >
            {/* Left section containing error code and message */}
            <div className={styles.errorSection}>
              <header>
                {/* Large 404 error code display */}
                <h1 id="error-title" className={styles.errorCode}>
                  404
                </h1>
                {/* Descriptive error message in French */}
                <h2 className={styles.errorMessage}>{t('notFound.text1')}</h2>
              </header>

              {/* Content section with poetic error description */}
              <section className={styles.contentSection}>
                <div className={styles.paragraphs}>
                  <p>{t('notFound.text2')}</p>
                  <p>{t('notFound.text3')}</p>
                </div>

                {/* Navigation link back to homepage */}
                <Link to="/" className={styles.homeLink}>
                  <span className={styles.linkText}>
                    {t('notFound.homeButton')}
                  </span>
                  <span className={styles.linkArrow}>→</span>
                </Link>
              </section>
            </div>

            {/* Decorative gear animations - hidden from screen readers */}
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
