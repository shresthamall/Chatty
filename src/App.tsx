import { NhostProvider } from '@nhost/react';
import { NhostApolloProvider } from '@nhost/react-apollo';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { nhost } from './utils/nhost';
import Auth from './pages/Auth';
import Chat from './pages/Chat';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import { useAuthenticationStatus } from '@nhost/react';

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost}>
        <InnerApp />
      </NhostApolloProvider>
    </NhostProvider>
  );
}

function InnerApp() {
  const { isLoading } = useAuthenticationStatus();

  if (isLoading) {
    return <div>Loading application...</div>;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Chat />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
