import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Member from '@/models/Member';
import Match from '@/models/Match';
import { generateMatches, MemberProfile } from '@/lib/claude';

type LeanMember = {
  _id: { toString(): string };
  name: string;
  role: string;
  title?: string;
  company?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  seeking?: string[];
  offering?: string[];
};

function toProfile(m: LeanMember): MemberProfile {
  return {
    memberId: m._id.toString(),
    name: m.name,
    role: m.role,
    title: m.title,
    company: m.company,
    bio: m.bio,
    skills: m.skills,
    interests: m.interests,
    seeking: m.seeking,
    offering: m.offering,
  };
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const current = (await Member.findById(userId).lean()) as LeanMember | null;
    if (!current) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const others = (await Member.find({
      _id: { $ne: current._id },
    }).lean()) as LeanMember[];

    if (others.length === 0) {
      return NextResponse.json(
        { error: 'Not enough members in the pool to generate matches' },
        { status: 400 }
      );
    }

    const currentProfile = toProfile(current);
    const otherProfiles = others.map(toProfile);

    const rawMatches = await generateMatches(currentProfile, otherProfiles);

    const othersById = new Map(others.map((m) => [m._id.toString(), m]));

    const validMatches = rawMatches
      .filter((m) => othersById.has(m.memberId))
      .map((m) => ({
        matchedMemberId: othersById.get(m.memberId)!._id,
        score: m.score,
        reasoning: m.reasoning,
        outreachDraft: '',
      }));

    const matchDoc = await Match.findOneAndUpdate(
      { memberId: current._id },
      {
        memberId: current._id,
        matches: validMatches,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    const merged = matchDoc!.matches.map((entry) => {
      const other = othersById.get(entry.matchedMemberId.toString());
      return {
        matchedMemberId: entry.matchedMemberId.toString(),
        score: entry.score,
        reasoning: entry.reasoning,
        outreachDraft: entry.outreachDraft,
        member: other
          ? {
              _id: other._id.toString(),
              name: other.name,
              role: other.role,
              title: other.title,
              company: other.company,
              bio: other.bio,
              skills: other.skills,
              interests: other.interests,
              seeking: other.seeking,
              offering: other.offering,
            }
          : null,
      };
    });

    return NextResponse.json({ matches: merged });
  } catch (err) {
    console.error('Match generate error:', err);
    const status = (err as { status?: number })?.status;
    if (status === 529 || status === 429) {
      return NextResponse.json(
        {
          error:
            'Claude is temporarily overloaded. Please try again in a minute.',
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to generate matches' },
      { status: 500 }
    );
  }
}
