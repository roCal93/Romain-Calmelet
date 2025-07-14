import styles from './LogoMobile.module.scss'
import { Link } from 'react-router'

const LogoMobile = () => {
  return (
    <div>
      <Link to="/" className={styles.logo} aria-label="Home">
        {/* Screen reader only text for accessibility */}
        <span className="sr-only">Calmelet Romain</span>

        <div className={styles.cWithR}>
          {/* Large "C" with rotation animation */}
          <span className={styles.bigC}>C</span>
          {/* Small "R" with translation animation */}
          <span className={styles.smallR}>R</span>
        </div>
      </Link>
    </div>
  )
}

export default LogoMobile
