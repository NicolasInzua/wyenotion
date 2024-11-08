import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const { setUsername } = useUser();
  const [localUsername, setLocalUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (error) return;

    setUsername(localUsername);
    router.push('/lobby');
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    setLocalUsername(newValue);

    if (newValue.trim() === '') {
      setError('Empty username not allowed');
      return;
    }

    setError('');
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-60">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg shadow-slate-350 rounded-lg px-6 py-8"
      >
        <h1 className="text-3xl font-bold mb-5">Welcome to WyeNotion</h1>
        <p className="mb-5">To get started, please enter your name:</p>
        <input
          type="text"
          placeholder="Enter your username"
          name="username"
          value={localUsername}
          onChange={handleChange}
          className="w-full rounded-md border-2 border-slate-100 mb-2 p-2"
        />
        {error && <p className="text-red-500 italic mb-2">{error}</p>}
        <button className="w-full text-md bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 px-4">
          Start Editing
        </button>
      </form>
    </div>
  );
}
