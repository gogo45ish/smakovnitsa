// Shell shared by every page: header, footer, overlays and the route effects
import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { lockScroll } from '../../lib/scroll.js';
import { useUI, closeLayer } from '../../store/ui.js';
import { Header } from './Header.jsx';
import { MobileMenu } from './MobileMenu.jsx';
import { Footer } from './Footer.jsx';
import { RouteEffects } from './RouteEffects.jsx';
import { CartDrawer } from '../overlays/CartDrawer.jsx';
import { ProductModal } from '../overlays/ProductModal.jsx';
import { Toast, LiveRegion, CookieCard, MobileCartBar, AddressSuggestions } from '../overlays/Feedback.jsx';

export function Layout() {
  const layer = useUI((s) => s.layer);
  const menuOpen = useUI((s) => s.menuOpen);
  useEffect(() => { lockScroll(!!layer || menuOpen); }, [layer, menuOpen]);

  const skipToMain = (e) => {
    e.preventDefault();
    document.getElementById('main')?.focus();
  };

  return (
    <>
      <a className="skip-link" href="#main" onClick={skipToMain}>Перейти к содержимому</a>
      <Header />
      <MobileMenu />
      <Outlet />
      <Footer />

      <div className={`scrim${layer ? ' is-open' : ''}`} data-scrim onClick={closeLayer} />
      <CartDrawer />
      <ProductModal />
      <MobileCartBar />
      <CookieCard />
      <Toast />
      <LiveRegion />
      <AddressSuggestions />
      <RouteEffects />
    </>
  );
}
