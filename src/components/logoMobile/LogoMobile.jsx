import styles from './logoMobile.module.scss'
import { Link } from 'react-router'

const LogoMobile = () => {
  return (
    <div>
      <Link to="/Romain-Calmelet/" className={styles.logo} aria-label="Home">
        {/* Ajout du texte pour les lecteurs d'écran */}
        <span className="sr-only">Calmelet Romain</span>
        <div className={styles.cWithR}>
          <span className={styles.bigC}>C</span>
          <span className={styles.smallR}>R</span>
        </div>
      </Link>
    </div>
  )
}

export default LogoMobile
