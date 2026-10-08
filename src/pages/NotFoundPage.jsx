import { Link, ArrowLink } from '../components/ui/Link.jsx';

export default function NotFoundPage() {
  return (
    <main id="main" tabIndex={-1} className="theme-dark noise">
      <title>Страница не найдена — Смаковница</title>
      <section className="page-hero not-found">
        <div className="container">
          <span className="t-eyebrow">Ошибка 404</span>
          <h1 className="t-h2">Такой страницы нет</h1>
          <p className="t-body-lg muted">Возможно, ссылка устарела. Меню и{' '}корзина на{' '}месте.</p>
          <div className="not-found-actions">
            <Link className="btn btn-primary" to="/menu">Открыть меню</Link>
            <ArrowLink to="/">На главную</ArrowLink>
          </div>
        </div>
      </section>
    </main>
  );
}
