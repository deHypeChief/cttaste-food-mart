import { useEffect, useState } from 'react';
import Button from '../../components/button';
import { useNavigate } from 'react-router-dom';

export default function ConfirmSuccess() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('email');
    if (e) setEmail(e);
  }, []);

  return (
    <div className="max-w-md mx-auto mt-28 p-6 bg-white rounded shadow text-center">
      <h2 className="text-2xl font-semibold">Email confirmed</h2>
      <p className="mt-3">Your account has been activated for <strong>{email}</strong>. You can now sign in.</p>
      <div className="mt-6">
        <Button onClick={() => navigate('/auth/login')}>Go to login</Button>
      </div>
    </div>
  );
}
