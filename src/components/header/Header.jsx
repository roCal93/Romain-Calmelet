import styles from './header.module.scss'
import LogoDesktop from '../logoDesktop/LogoDesktop'
import LogoMobile from '../logoMobile/LogoMobile'
import { useMediaQuery } from 'react-responsive'
import { Link } from 'react-router'

const Header = () => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  return (
    <header>
      <nav className={styles.nav}>
        {isMobile ? <LogoMobile /> : <LogoDesktop />}
        <ul className={styles.menu}>
          <li className={styles.li}>
            <Link className={styles.link}>PRESENTATION</Link>
          </li>
          <li className={styles.li}>
            <Link className={styles.link}>COMPETENCES</Link>
          </li>
          <li className={styles.li}>
            <Link className={styles.link}>FORMATION</Link>
          </li>
          <li className={styles.li}>
            <Link className={styles.link}>PORTFOLIO</Link>
          </li>
          <li className={styles.li}>
            <Link className={styles.link}>CONTACT</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
