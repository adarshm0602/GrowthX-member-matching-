'use client';

import { useMemo, useState } from 'react';
import MemberCard, { MemberCardData } from '@/components/MemberCard';

export default function MembersBrowser({
  members,
}: {
  members: MemberCardData[];
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      if (m.name?.toLowerCase().includes(q)) return true;
      if (m.role?.toLowerCase().includes(q)) return true;
      if ((m.skills ?? []).some((s) => s.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [members, query]);

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, skill, or role..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <p className="text-xs text-gray-500 mt-2">
          {filtered.length} {filtered.length === 1 ? 'member' : 'members'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">
          <p className="text-sm text-gray-500">No members match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => (
            <MemberCard key={m._id} member={m} />
          ))}
        </div>
      )}
    </div>
  );
}
