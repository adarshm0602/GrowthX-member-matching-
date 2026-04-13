'use client';

import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';

export type ProfileData = {
  _id: string;
  name: string;
  email: string;
  role: 'founder' | 'professional' | string;
  title?: string;
  company?: string;
  city?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  seeking?: string[];
  offering?: string[];
  linkedin?: string;
  github?: string;
};

type EditState = {
  bio: string;
  skills: string[];
  interests: string[];
  seeking: string[];
  offering: string[];
  linkedin: string;
  github: string;
};

type TagField = 'skills' | 'interests' | 'seeking' | 'offering';

function Chips({ items, empty = '—' }: { items?: string[]; empty?: string }) {
  if (!items || items.length === 0)
    return <span className="text-sm text-gray-400">{empty}</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span
          key={s}
          className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function List({ items, empty = '—' }: { items?: string[]; empty?: string }) {
  if (!items || items.length === 0)
    return <p className="text-sm text-gray-400">{empty}</p>;
  return (
    <ul className="text-sm text-gray-700 space-y-0.5">
      {items.map((i) => (
        <li key={i}>• {i}</li>
      ))}
    </ul>
  );
}

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

export default function ProfileView({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [edit, setEdit] = useState<EditState>({
    bio: profile.bio ?? '',
    skills: profile.skills ?? [],
    interests: profile.interests ?? [],
    seeking: profile.seeking ?? [],
    offering: profile.offering ?? [],
    linkedin: profile.linkedin ?? '',
    github: profile.github ?? '',
  });

  const addTag = (k: TagField) => (v: string) =>
    setEdit((e) => ({ ...e, [k]: [...e[k], v] }));
  const removeTag = (k: TagField) => (i: number) =>
    setEdit((e) => ({ ...e, [k]: e[k].filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edit),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to save');
        setSaving(false);
        return;
      }
      setEditing(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEdit({
      bio: profile.bio ?? '',
      skills: profile.skills ?? [],
      interests: profile.interests ?? [],
      seeking: profile.seeking ?? [],
      offering: profile.offering ?? [],
      linkedin: profile.linkedin ?? '',
      github: profile.github ?? '',
    });
    setEditing(false);
    setError('');
  };

  const inputCls =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900';

  const roleLabel =
    profile.role === 'founder'
      ? 'Founder'
      : profile.role === 'professional'
        ? 'Professional'
        : profile.role;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900">
              {profile.name}
            </h2>
            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
              {roleLabel}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {[profile.title, profile.company].filter(Boolean).join(' · ') || '—'}
            {profile.city ? ` · ${profile.city}` : ''}
          </p>
          <p className="text-xs text-gray-400 mt-1">{profile.email}</p>
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="px-4 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-black"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-900 hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {!editing ? (
        <div className="space-y-6">
          <Section title="Bio">
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {profile.bio || '—'}
            </p>
          </Section>
          <Section title="Skills">
            <Chips items={profile.skills} />
          </Section>
          <Section title="Interests">
            <Chips items={profile.interests} />
          </Section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="Seeking">
              <List items={profile.seeking} />
            </Section>
            <Section title="Offering">
              <List items={profile.offering} />
            </Section>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="LinkedIn">
              {profile.linkedin ? (
                <a
                  className="text-sm text-gray-900 underline break-all"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  {profile.linkedin}
                </a>
              ) : (
                <span className="text-sm text-gray-400">—</span>
              )}
            </Section>
            <Section title="GitHub">
              {profile.github ? (
                <a
                  className="text-sm text-gray-900 underline break-all"
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  {profile.github}
                </a>
              ) : (
                <span className="text-sm text-gray-400">—</span>
              )}
            </Section>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              className={inputCls}
              value={edit.bio}
              onChange={(e) => setEdit({ ...edit, bio: e.target.value })}
            />
          </div>
          <TagInput
            label="Skills"
            values={edit.skills}
            onAdd={addTag('skills')}
            onRemove={removeTag('skills')}
          />
          <TagInput
            label="Interests"
            values={edit.interests}
            onAdd={addTag('interests')}
            onRemove={removeTag('interests')}
          />
          <TagInput
            label="Seeking"
            values={edit.seeking}
            onAdd={addTag('seeking')}
            onRemove={removeTag('seeking')}
          />
          <TagInput
            label="Offering"
            values={edit.offering}
            onAdd={addTag('offering')}
            onRemove={removeTag('offering')}
          />
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              LinkedIn URL
            </label>
            <input
              className={inputCls}
              value={edit.linkedin}
              onChange={(e) => setEdit({ ...edit, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              GitHub URL
            </label>
            <input
              className={inputCls}
              value={edit.github}
              onChange={(e) => setEdit({ ...edit, github: e.target.value })}
              placeholder="https://github.com/..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-wide uppercase text-gray-500 mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}
