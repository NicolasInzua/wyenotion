import { createContext, useContext, useEffect, useState } from 'react';

interface UserContext {
  username: string;
  isLoading: boolean;
  setUsername: (newUsername: string) => void;
}

export const UserContext = createContext<UserContext | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    setIsLoading(false);
    return () => {
      setUsername('');
      localStorage.removeItem('username');
    };
  }, []);

  const handleSetUsername = (newUsername: string) => {
    setUsername(newUsername);
    localStorage.setItem('username', newUsername);
  };

  return (
    <UserContext.Provider
      value={{ username, isLoading, setUsername: handleSetUsername }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
