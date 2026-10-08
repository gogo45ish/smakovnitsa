import { useRef } from 'react';
import { useReveals } from '../hooks/useReveals.js';
import { Hero } from '../components/home/Hero.jsx';
import { About } from '../components/home/About.jsx';
import { Categories } from '../components/home/Categories.jsx';
import { WhyUs } from '../components/home/WhyUs.jsx';
import { MenuSection } from '../components/home/MenuSection.jsx';
import { StatsBand } from '../components/home/StatsBand.jsx';
import { Events } from '../components/home/Events.jsx';
import { Reviews } from '../components/home/Reviews.jsx';
import { Zones } from '../components/home/Zones.jsx';

// Section rhythm (§2): dark → white → white → rice → dark → salmon band → dark → white → dark
export default function HomePage() {
  const main = useRef(null);
  useReveals(main);
  return (
    <main id="main" tabIndex={-1} ref={main}>
      <title>Смаковница — доставка роллов и суши в Москве</title>
      <meta name="description" content="Свежие роллы из охлаждённой рыбы. Готовим после заказа, привезём за 45 минут или вернём деньги." />
      <Hero />
      <About />
      <Categories />
      <WhyUs />
      <MenuSection />
      <StatsBand />
      <Events />
      <Reviews />
      <Zones />
    </main>
  );
}
