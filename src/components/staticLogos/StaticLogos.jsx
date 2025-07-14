import { memo } from 'react'
import LogoSocial from '../logoSocial/LogoSocial'
import AlternatingContactLogo from '../alternatingContactLogo/AlternatingContactLogo'
import styles from './StaticLogos.module.scss'

/**
 * StaticLogos Component
 *
 * Displays a fixed-position container with social media links and contact button.
 * Hidden when a game is active.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.activeGame - Whether a game is currently active
 * @param {Function} props.handleLogoClick - Click handler for logo interactions
 * @returns {JSX.Element|null} Navigation container with social links or null
 */
const StaticLogos = memo(({ activeGame, handleLogoClick }) => {
  // Hide component when game is active
  if (activeGame) return null

  return (
    <nav
      className={styles.logosContainer}
      aria-label="Social media links"
      role="navigation"
    >
      <LogoSocial
        type="linkedin"
        onClick={handleLogoClick}
        aria-label="Visit LinkedIn profile"
      />
      <LogoSocial
        type="github"
        onClick={handleLogoClick}
        aria-label="Visit GitHub profile"
      />
      <AlternatingContactLogo
        onClick={() => handleLogoClick('phone')}
        aria-label="Contact information"
      />
    </nav>
  )
})

StaticLogos.displayName = 'StaticLogos'

export default StaticLogos
