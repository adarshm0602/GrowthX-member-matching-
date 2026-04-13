export type MemberCardData = {
  _id: string;
  name: string;
  role: 'founder' | 'professional' | string;
  title?: string;
  company?: string;
  city?: string;
  skills?: string[];
  seeking?: string[];
  offering?: string[];
};

export default function MemberCard({ member }: { member: MemberCardData }) {
  const roleLabel =
    member.role === 'founder'
      ? 'Founder'
      : member.role === 'professional'
        ? 'Professional'
        : member.role;

  const skills = (member.skills ?? []).slice(0, 3);
  const seekingOne = member.seeking?.[0];
  const offeringOne = member.offering?.[0];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
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

      {member.city && (
        <p className="text-xs text-gray-500">📍 {member.city}</p>
      )}

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

      <div className="text-xs space-y-1 pt-1 border-t border-gray-100">
        <p className="text-gray-700">
          <span className="font-medium text-gray-900">Seeking: </span>
          <span className="text-gray-600">{seekingOne || '—'}</span>
        </p>
        <p className="text-gray-700">
          <span className="font-medium text-gray-900">Offering: </span>
          <span className="text-gray-600">{offeringOne || '—'}</span>
        </p>
      </div>
    </div>
  );
}
