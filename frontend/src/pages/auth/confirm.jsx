import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../../components/button';
import { apiClient } from '../../api/client';

export default function Confirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Missing token');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        // clear previous errors when (re)trying
        setError(null);
        const res = await apiClient.get(`/auth/confirm?token=${encodeURIComponent(token)}`);
        // Prefer explicit fields from the API when available
        if (res?.email) setEmail(res.email);
        if (res?.success) {
          setError(null);
          setSuccess(true);
        } else if (res?.redirect) {
          // If backend wants to redirect to a friendly page, follow it
          try {
            const url = new URL(res.data.redirect);
            const e = url.searchParams.get('email') || '';
            navigate(`/auth/confirmed?email=${encodeURIComponent(e)}`, { replace: true });
            return;
          } catch {
            setError(null);
            setSuccess(true);
          }
        } else {
          setError(null);
          setSuccess(true);
        }
      } catch (err) {
        // apiClient rejects with a custom Error containing .data when available
        console.error('Confirm request failed', err);
        setError(err?.data?.message || err?.message || 'Confirmation failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, searchParams]);

  // token and api origin handled during initial effect; not needed directly here

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-28 p-6 bg-white rounded shadow text-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mb-4" />
          <p className="text-gray-700">Confirming your account — please wait...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-28 p-6 bg-white rounded shadow text-center">
        <div className="flex items-center justify-center mb-4">
          <svg className="h-12 w-12 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            <path d="M7 12.5l2.5 2.5L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold">Email verified — you're all set</h2>
        <p className="mt-3 text-gray-700">{email ? (
          <>We have successfully activated your account for <strong>{email}</strong>. You can now sign in to access your account and start using our services.</>
        ) : (
          'We have successfully verified your email. You can now sign in to access your account.'
        )}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigate('/auth/login')} variant="primary">Sign in</Button>
          <Button onClick={() => navigate('/')} variant="secondary">Go to Home</Button>
        </div>
      </div>
    );
  }

  // Failure UI
  return (
    <div className="max-w-md mx-auto mt-28 p-6 bg-white rounded shadow text-center">
      <h2 className="text-2xl font-semibold text-red-600">Confirmation failed — action needed</h2>
      <p className="mt-3 text-gray-700">{error || 'We couldn\'t verify your email with this link. This can happen if the link is expired or invalid.'}</p>
      <p className="mt-2 text-gray-600 text-sm">Try registering again, request a new confirmation email from the registration page, or sign in if you already completed confirmation. If the problem continues, contact support for help.</p>
      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
        <Button onClick={() => navigate('/auth/register')} variant="secondary">Register</Button>
        <Button onClick={() => navigate('/auth/login')} variant="ghost">Go to login</Button>
      </div>
    </div>
  );
}
