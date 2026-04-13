import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Member from '@/models/Member';
import ProfileView, { ProfileData } from './ProfileView';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect('/signin');

  await connectDB();

  const doc = await Member.findById(userId).select('-password').lean();
  if (!doc) redirect('/signin');

  const profile: ProfileData = {
    _id: (doc as { _id: { toString(): string } })._id.toString(),
    name: (doc as { name: string }).name,
    email: (doc as { email: string }).email,
    role: (doc as { role: string }).role,
    title: (doc as { title?: string }).title,
    company: (doc as { company?: string }).company,
    city: (doc as { city?: string }).city,
    bio: (doc as { bio?: string }).bio,
    skills: (doc as { skills?: string[] }).skills,
    interests: (doc as { interests?: string[] }).interests,
    seeking: (doc as { seeking?: string[] }).seeking,
    offering: (doc as { offering?: string[] }).offering,
    linkedin: (doc as { linkedin?: string }).linkedin,
    github: (doc as { github?: string }).github,
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-6">Your Profile</h1>
        <ProfileView profile={profile} />
      </div>
    </div>
  );
}
