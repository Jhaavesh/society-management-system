import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocietyProvider } from './context/SocietyContext.jsx';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SocietyProvider>
        <App />
      </SocietyProvider>
    </AuthProvider>
  </StrictMode>
);
