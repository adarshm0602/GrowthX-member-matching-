import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Member from '@/models/Member';
import Match from '@/models/Match';
import { generateOutreach, MemberProfile } from '@/lib/claude';

function toProfile(m: {
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
}): MemberProfile {
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { matchedMemberId } = body ?? {};
    if (!matchedMemberId) {
      return NextResponse.json(
        { error: 'matchedMemberId is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const [current, matched] = await Promise.all([
      Member.findById(userId).lean(),
      Member.findById(matchedMemberId).lean(),
    ]);

    if (!current || !matched) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const matchDoc = await Match.findOne({ memberId: userId });
    if (!matchDoc) {
      return NextResponse.json(
        { error: 'No matches found. Generate matches first.' },
        { status: 404 }
      );
    }

    const entry = matchDoc.matches.find(
      (m) => m.matchedMemberId.toString() === matchedMemberId
    );
    if (!entry) {
      return NextResponse.json(
        { error: 'Matched member is not in your match list' },
        { status: 404 }
      );
    }

    const outreachDraft = await generateOutreach(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toProfile(current as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toProfile(matched as any),
      entry.reasoning
    );

    entry.outreachDraft = outreachDraft;
    await matchDoc.save();

    return NextResponse.json({ outreachDraft });
  } catch (err) {
    console.error('Outreach generate error:', err);
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
      { error: 'Failed to generate outreach' },
      { status: 500 }
    );
  }
}
