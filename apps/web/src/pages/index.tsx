import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const USERNAME_MIN_LENGTH = 3;

export default function Home() {
  const router = useRouter();
  const { setUsername } = useUser();
  const [localUsername, setLocalUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isDisabled =
    !!error || localUsername.trim().length < USERNAME_MIN_LENGTH || isLoading;

  useEffect(() => {
    document.body.classList.add(
      'bg-gradient-to-b',
      'from-red-500',
      'to-neutral-950'
    );
    return () => {
      document.body.classList.remove(
        'bg-gradient-to-b',
        'from-red-500',
        'to-red-600'
      );
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (error || localUsername.trim().length < USERNAME_MIN_LENGTH) return;

    setIsLoading(true);
    setUsername(localUsername.trim());
    await router.push('/lobby');
    setIsLoading(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    setLocalUsername(newValue);

    if (newValue.trim().length < USERNAME_MIN_LENGTH) {
      setError(
        `Username must be at least ${USERNAME_MIN_LENGTH} characters long`
      );
      return;
    }
    setError(null);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-lg rounded-md p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Welcome to WyeNotion
        </h1>
        <p className="mb-5 text-gray-600">
          To get started, please enter your <strong>username</strong>:
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your username"
            name="username"
            value={localUsername}
            onChange={handleChange}
            className="w-full rounded-md border-2 mb-1 border-slate-100 p-3 focus:outline-none  focus:border-slate-400"
          />
          <div className="h-6 mb-2 ml-1">
            {error && <p className="text-sm text-red-500 italic">{error}</p>}
          </div>
          <button
            type="submit"
            className={`w-full text-md bg-red-600 hover:bg-red-600 text-white rounded-md py-3 px-6 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isDisabled}
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <p className="font-bold">Start Editing</p>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
