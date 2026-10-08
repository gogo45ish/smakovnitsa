// Entry: one React app, client-side routing — pages swap without reloading the document.
// Styles are linked from index.html (render-blocking), not imported here.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { initScroll } from './lib/scroll.js';
import { router } from './router.jsx';

initScroll();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
