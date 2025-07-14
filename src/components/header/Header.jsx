import styles from './header.module.scss'
import LogoDesktop from '../logoDesktop/LogoDesktop'
import LogoMobile from '../logoMobile/LogoMobile'
import { useMediaQuery } from 'react-responsive'
import MenuDesktop from '../menuDesktop/MenuDesktop'
import MenuMobile from '../menuMobile/MenuMobile'

/**
 * Header component that displays navigation with responsive logo and menu
 * Adapts to different screen sizes using media queries
 */
const Header = () => {
  // Media queries for responsive behavior
  const isMobileLogo = useMediaQuery({ query: '(max-width: 768px)' })
  const isMobileMenu = useMediaQuery({ query: '(max-width: 1250px)' })

  // Conditional rendering based on screen size
  const LogoComponent = isMobileLogo ? <LogoMobile /> : <LogoDesktop />
  const MenuComponent = isMobileMenu ? <MenuMobile /> : <MenuDesktop />

  return (
    <header className={styles.header} role="banner">
      <nav
        className={styles.nav}
        role="navigation"
        aria-label="Main navigation"
      >
        {LogoComponent}
        {MenuComponent}
      </nav>
    </header>
  )
}

export default Header
