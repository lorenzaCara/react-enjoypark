import { useUser } from '@/contexts/UserProvider';
import { useState } from 'react';
import { useNavigate } from 'react-router';


const ResetPasswordPage = () => {
  const { updatePassword } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== newPasswordConfirmation) {
      setError('Le password non corrispondono');
      return;
    }

    const res = await updatePassword({
      email,
      recoveryCode,
      newPassword,
      newPasswordConfirmation,
    });

    if (res.success) {
      setMessage(res.message);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Reimposta la tua password</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </label>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Codice di recupero
          <input
            type="text"
            required
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </label>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Nuova password
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </label>

        <label className="block mb-4 text-sm font-medium text-gray-700">
          Conferma nuova password
          <input
            type="password"
            required
            value={newPasswordConfirmation}
            onChange={(e) => setNewPasswordConfirmation(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
        >
          Reimposta password
        </button>

        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default ResetPasswordPage;
