'use client';

import { useState } from 'react';

type MatchMember = {
  _id?: string;
  name: string;
  title?: string;
  company?: string;
  role: 'founder' | 'professional' | string;
  skills?: string[];
  offering?: string[];
  seeking?: string[];
  bio?: string;
};

type Props = {
  member: MatchMember;
  matchedMemberId: string;
  score: number;
  reasoning: string;
  outreachDraft?: string;
};

export default function MatchCard({
  member,
  matchedMemberId,
  score,
  reasoning,
  outreachDraft: initialDraft,
}: Props) {
  const [draft, setDraft] = useState(initialDraft ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchedMemberId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate intro');
      } else {
        setDraft(data.outreachDraft || '');
      }
    } catch (e) {
      console.error(e);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!draft) return;
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const roleLabel =
    member.role === 'founder'
      ? 'Founder'
      : member.role === 'professional'
        ? 'Professional'
        : member.role;

  const skills = (member.skills ?? []).slice(0, 4);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {member.name}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {[member.title, member.company].filter(Boolean).join(' · ') || '—'}
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
          {roleLabel}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs font-medium text-gray-700 mb-1">
          <span>Compatibility</span>
          <span>{clampedScore}% match</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded">
          <div
            className="h-full bg-gray-900 rounded"
            style={{ width: `${clampedScore}%` }}
          />
        </div>
      </div>

      <p className="text-sm italic text-gray-700 leading-relaxed">
        {reasoning}
      </p>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <span
              key={s}
              className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="font-medium text-gray-900 mb-1">Offering</p>
          <ul className="space-y-0.5 text-gray-600">
            {(member.offering ?? []).slice(0, 4).map((o) => (
              <li key={o}>• {o}</li>
            ))}
            {(!member.offering || member.offering.length === 0) && (
              <li className="text-gray-400">—</li>
            )}
          </ul>
        </div>
        <div>
          <p className="font-medium text-gray-900 mb-1">Seeking</p>
          <ul className="space-y-0.5 text-gray-600">
            {(member.seeking ?? []).slice(0, 4).map((o) => (
              <li key={o}>• {o}</li>
            ))}
            {(!member.seeking || member.seeking.length === 0) && (
              <li className="text-gray-400">—</li>
            )}
          </ul>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-60"
        >
          {loading && (
            <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {loading
            ? 'Generating...'
            : draft
              ? 'Regenerate Intro Message'
              : 'Generate Intro Message'}
        </button>
        {error && (
          <p className="text-xs text-red-600 mt-2">{error}</p>
        )}
      </div>

      {draft && (
        <div>
          <textarea
            readOnly
            value={draft}
            rows={5}
            className="w-full text-sm text-gray-900 border border-gray-200 rounded-md p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
