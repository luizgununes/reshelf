import { createRoot } from 'react-dom/client';
import { followSystemTheme } from './theme';
import { StrictMode } from 'react';
import { App } from './App';
import './globals.css';

followSystemTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
