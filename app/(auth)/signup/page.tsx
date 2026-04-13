'use client';

import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

type FormData = {
  name: string;
  email: string;
  password: string;
  role: 'founder' | 'professional' | '';
  title: string;
  company: string;
  city: string;
  bio: string;
  skills: string[];
  interests: string[];
  seeking: string[];
  offering: string[];
  linkedin: string;
  github: string;
};

const initialForm: FormData = {
  name: '',
  email: '',
  password: '',
  role: '',
  title: '',
  company: '',
  city: '',
  bio: '',
  skills: [],
  interests: [],
  seeking: [],
  offering: [],
  linkedin: '',
  github: '',
};

type TagField = 'skills' | 'interests' | 'seeking' | 'offering';

function TagInput({
  label,
  placeholder,
  values,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder?: string;
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
}) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const v = draft.trim().replace(/,$/, '').trim();
    if (v) onAdd(v);
    setDraft('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !draft && values.length) {
      onRemove(values.length - 1);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-1">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md px-2 py-2 focus-within:ring-2 focus-within:ring-gray-900">
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1 bg-gray-100 text-gray-900 text-sm px-2 py-1 rounded"
          >
            {v}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="text-gray-500 hover:text-gray-900"
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={commit}
          placeholder={placeholder ?? 'Type and press Enter'}
          className="flex-1 min-w-[120px] outline-none text-sm text-gray-900 bg-transparent"
        />
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addTag = (key: TagField) => (v: string) =>
    setForm((f) => ({ ...f, [key]: [...f[key], v] }));

  const removeTag = (key: TagField) => (i: number) =>
    setForm((f) => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) }));

  const validateStep = (): string => {
    if (step === 1) {
      if (!form.name.trim()) return 'Full name is required';
      if (!form.email.trim()) return 'Email is required';
      if (!form.password || form.password.length < 6)
        return 'Password must be at least 6 characters';
      if (!form.role) return 'Please select a role';
    }
    return '';
  };

  const handleNext = () => {
    const v = validateStep();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setStep((s) => Math.min(3, s + 1));
  };

  const handleBack = () => {
    setError('');
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Registration failed');
        setSubmitting(false);
        return;
      }

      const signInRes = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError('Account created, but sign-in failed. Please sign in manually.');
        setSubmitting(false);
        return;
      }

      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900';
  const labelCls = 'block text-sm font-medium text-gray-900 mb-1';

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Join the community</h1>
          <p className="text-sm text-gray-500 mt-1">
            Step {step} of 3
          </p>
          <div className="h-1.5 w-full bg-gray-100 rounded mt-3 overflow-hidden">
            <div
              className="h-full bg-gray-900 transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                className={inputCls}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Role</label>
              <select
                className={inputCls}
                value={form.role}
                onChange={(e) =>
                  update('role', e.target.value as FormData['role'])
                }
              >
                <option value="">Select a role</option>
                <option value="founder">Founder</option>
                <option value="professional">Professional</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Job Title</label>
              <input
                className={inputCls}
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Company</label>
              <input
                className={inputCls}
                value={form.company}
                onChange={(e) => update('company', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input
                className={inputCls}
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Bio</label>
              <textarea
                rows={3}
                className={inputCls}
                value={form.bio}
                onChange={(e) => update('bio', e.target.value)}
              />
            </div>
            <TagInput
              label="Skills"
              placeholder="e.g. React, Product Strategy"
              values={form.skills}
              onAdd={addTag('skills')}
              onRemove={removeTag('skills')}
            />
            <TagInput
              label="Interests"
              placeholder="e.g. AI, Climate"
              values={form.interests}
              onAdd={addTag('interests')}
              onRemove={removeTag('interests')}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <TagInput
              label="Seeking"
              placeholder="What do you want from the community?"
              values={form.seeking}
              onAdd={addTag('seeking')}
              onRemove={removeTag('seeking')}
            />
            <TagInput
              label="Offering"
              placeholder="What can you give to the community?"
              values={form.offering}
              onAdd={addTag('offering')}
              onRemove={removeTag('offering')}
            />
            <div>
              <label className={labelCls}>LinkedIn URL</label>
              <input
                className={inputCls}
                value={form.linkedin}
                onChange={(e) => update('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className={labelCls}>GitHub URL</label>
              <input
                className={inputCls}
                value={form.github}
                onChange={(e) => update('github', e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || submitting}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-900 disabled:opacity-40 hover:bg-gray-50"
          >
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-black"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-60"
            >
              {submitting ? 'Joining...' : 'Join Community'}
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already a member?{' '}
          <Link href="/signin" className="text-gray-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
