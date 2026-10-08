// Router links that crossfade between pages with the View Transitions API (where supported).
import { Link as RouterLink, NavLink as RouterNavLink } from 'react-router';

export const Link = (props) => <RouterLink viewTransition {...props} />;
export const NavLink = (props) => <RouterNavLink viewTransition {...props} />;

/** «Текст →» link with the sliding arrow */
export const ArrowLink = ({ children, ...props }) => (
  <Link className="link-arrow" {...props}>{children} <span className="arr">→</span></Link>
);
