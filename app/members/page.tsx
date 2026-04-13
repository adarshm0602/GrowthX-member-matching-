import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Member from '@/models/Member';
import MembersBrowser from './MembersBrowser';
import { MemberCardData } from '@/components/MemberCard';

export const dynamic = 'force-dynamic';

type LeanMember = {
  _id: { toString(): string };
  name: string;
  role: string;
  title?: string;
  company?: string;
  city?: string;
  skills?: string[];
  seeking?: string[];
  offering?: string[];
};

export default async function MembersPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/signin');

  await connectDB();

  const docs = (await Member.find({ _id: { $ne: userId } })
    .select('name role title company city skills seeking offering')
    .lean()) as LeanMember[];

  const members: MemberCardData[] = docs.map((m) => ({
    _id: m._id.toString(),
    name: m.name,
    role: m.role,
    title: m.title,
    company: m.company,
    city: m.city,
    skills: m.skills,
    seeking: m.seeking,
    offering: m.offering,
  }));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Community</h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse everyone in the GrowthX community.
          </p>
        </div>
        <MembersBrowser members={members} />
      </div>
    </div>
  );
}
