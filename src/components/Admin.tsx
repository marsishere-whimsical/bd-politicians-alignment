import { useState } from 'react';
import AdminAuthenticated from './AdminAuthenticated';

function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
      } else {
        alert('Incorrect password');
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    }
    setIsLoading(false);
  };

  if (isAuthenticated) {
    return <AdminAuthenticated />;
  }

  return (
    <div className="bg-black flex items-center justify-center">
      <div className="bg-neutral-900 p-8 rounded-lg w-[400px] border border-neutral-700">
        <h2 className="text-2xl text-neutral-200 mb-6">Admin Login</h2>
        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter password"
            className="w-full p-2 rounded bg-neutral-800 text-neutral-200 border border-neutral-600 focus:border-white outline-none"
          />
          <button
            onClick={handleLogin}
            className="w-full px-4 py-2 bg-white text-black rounded hover:bg-neutral-200 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : (
              'Login'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Admin;