import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Match from '@/models/Match';
// Ensure Member model is registered before populate runs.
import '@/models/Member';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const doc = await Match.findOne({ memberId: userId })
      .populate({
        path: 'matches.matchedMemberId',
        select: 'name title company role skills offering seeking bio',
      })
      .lean();

    if (!doc) {
      return NextResponse.json({ matches: [], generatedAt: null });
    }

    return NextResponse.json({
      matches: doc.matches,
      generatedAt: doc.generatedAt,
    });
  } catch (err) {
    console.error('Match results error:', err);
    return NextResponse.json(
      { error: 'Failed to load match results' },
      { status: 500 }
    );
  }
}
