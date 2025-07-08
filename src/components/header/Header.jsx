import { useMemo, useState } from 'react'
import styles from './header.module.scss'
import LogoDesktop from '../logoDesktop/LogoDesktop'
import LogoMobile from '../logoMobile/LogoMobile'
import { useMediaQuery } from 'react-responsive'
import MenuDesktop from '../menuDesktop/MenuDesktop'
import MenuMobile from '../menuMobile/MenuMobile'

const Header = () => {
  const [hasError, setHasError] = useState(false)

  // Les hooks doivent être appelés de manière inconditionnelle
  const isMobileLogo = useMediaQuery({ query: '(max-width: 768px)' })
  const isMobileMenu = useMediaQuery({ query: '(max-width: 1250px)' })

  // Évite les re-renders inutiles des composants avec useMemo
  const LogoComponent = useMemo(
    () => (isMobileLogo ? <LogoMobile /> : <LogoDesktop />),
    [isMobileLogo]
  )

  const MenuComponent = useMemo(
    () => (isMobileMenu ? <MenuMobile /> : <MenuDesktop />),
    [isMobileMenu]
  )

  // Fallback en cas d'erreur - affiche la version desktop
  if (hasError) {
    return (
      <header className={styles.header} role="banner">
        <nav
          className={styles.nav}
          role="navigation"
          aria-label="Navigation principale"
        >
          <LogoDesktop />
          <MenuDesktop />
        </nav>
      </header>
    )
  }

  try {
    return (
      <header className={styles.header} role="banner">
        <nav
          className={styles.nav}
          role="navigation"
          aria-label="Navigation principale"
        >
          {LogoComponent}
          {MenuComponent}
        </nav>
      </header>
    )
  } catch (error) {
    console.error('Erreur dans le composant Header:', error)
    setHasError(true)
    return null
  }
}

export default Header
