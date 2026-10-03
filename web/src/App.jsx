import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppShell from './components/layout/AppShell';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
