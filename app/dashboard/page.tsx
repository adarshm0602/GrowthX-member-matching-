import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Match from '@/models/Match';
import '@/models/Member';
import MatchCard from '@/components/MatchCard';
import RefreshButton from './RefreshButton';

export const dynamic = 'force-dynamic';

type PopulatedMember = {
  _id: { toString(): string };
  name: string;
  title?: string;
  company?: string;
  role: string;
  skills?: string[];
  offering?: string[];
  seeking?: string[];
  bio?: string;
};

type PopulatedEntry = {
  matchedMemberId: PopulatedMember | null;
  score: number;
  reasoning: string;
  outreachDraft?: string;
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/signin');

  await connectDB();

  const doc = (await Match.findOne({ memberId: userId })
    .populate({
      path: 'matches.matchedMemberId',
      select: 'name title company role skills offering seeking bio',
    })
    .lean()) as { matches: PopulatedEntry[]; generatedAt: Date } | null;

  const matches = doc?.matches ?? [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Your Matches</h1>
            <p className="text-sm text-gray-500 mt-1">
              Powered by AI — updated each time you run matching
            </p>
            {doc?.generatedAt && (
              <p className="text-xs text-gray-400 mt-1">
                Last generated:{' '}
                {new Date(doc.generatedAt).toLocaleString()}
              </p>
            )}
          </div>
          {matches.length > 0 && <RefreshButton />}
        </div>

        {matches.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No matches yet
            </h2>
            <p className="text-sm text-gray-500 mt-2 mb-6 max-w-md mx-auto">
              Run the matchmaker to find five GrowthX members who complement
              what you&apos;re seeking and offering.
            </p>
            <div className="flex justify-center">
              <RefreshButton label="Find My Matches" primary />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {matches.map((m, i) => {
              const mem = m.matchedMemberId;
              if (!mem) return null;
              return (
                <MatchCard
                  key={mem._id.toString() + i}
                  matchedMemberId={mem._id.toString()}
                  member={{
                    _id: mem._id.toString(),
                    name: mem.name,
                    title: mem.title,
                    company: mem.company,
                    role: mem.role,
                    skills: mem.skills,
                    offering: mem.offering,
                    seeking: mem.seeking,
                    bio: mem.bio,
                  }}
                  score={m.score}
                  reasoning={m.reasoning}
                  outreachDraft={m.outreachDraft}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
