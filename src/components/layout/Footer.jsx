import { tg } from '../../lib/format.js';
import { Link } from '../ui/Link.jsx';
import { Logo } from './Header.jsx';

const MENU = [['rolls', 'Роллы'], ['sets', 'Сеты'], ['sushi', 'Суши'], ['hot', 'Горячее'], ['drinks', 'Напитки']];
const PAY = ['Мир', 'Visa', 'Mastercard', 'СБП', 'SberPay', 'Наличные курьеру'];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Logo />
            <p>{tg('Японская кухня с доставкой по Москве. Готовим из охлаждённой рыбы после вашего заказа.')}</p>
          </div>
          <div className="footer-col">
            <h3>Меню</h3>
            <ul>{MENU.map(([id, label]) => <li key={id}><Link to={`/menu#${id}`}>{label}</Link></li>)}</ul>
          </div>
          <div className="footer-col">
            <h3>Клиентам</h3>
            <ul>
              <li><Link to="/#delivery">Доставка и оплата</Link></li>
              <li><a href="#">Бонусы</a></li>
              <li><Link to="/menu#promo">Акции</Link></li>
              <li><a href="#">Вакансии</a></li>
            </ul>
          </div>
          <div className="footer-col footer-contacts">
            <h3>Контакты</h3>
            <ul>
              <li><a className="phone" href="tel:+74951234567">+7 (495) 123-45-67</a></li>
              <li><a href="https://t.me/" rel="noopener">Telegram</a></li>
              <li><a href="https://vk.com/" rel="noopener">ВКонтакте</a></li>
              <li><a href="mailto:hello@smakovnitsa.ru">hello@smakovnitsa.ru</a></li>
            </ul>
          </div>
        </div>
        <div className="pay-row" aria-label="Способы оплаты">
          {PAY.map((p) => <span key={p} className="pay-badge">{p}</span>)}
        </div>
        <div className="legal">
          <div>
            <p>ООО „Смаковница“ · ИНН 0000000000 · ОГРН 0000000000000</p>
            <p>© 2026 Смаковница. Все права защищены.</p>
          </div>
          <div className="legal-links">
            <a href="#">Политика конфиденциальности</a>
            <a href="#">Пользовательское соглашение</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
