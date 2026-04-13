import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Member from '@/models/Member';

const EDITABLE_FIELDS = [
  'name',
  'title',
  'company',
  'city',
  'bio',
  'skills',
  'interests',
  'seeking',
  'offering',
  'linkedin',
  'github',
] as const;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const members = await Member.find({ _id: { $ne: userId } })
      .select('-password')
      .lean();

    return NextResponse.json({ members });
  } catch (err) {
    console.error('List members error:', err);
    return NextResponse.json(
      { error: 'Failed to list members' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const update: Record<string, unknown> = {};
    for (const k of EDITABLE_FIELDS) {
      if (k in body) update[k] = body[k];
    }

    await connectDB();

    const updated = await Member.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .lean();

    if (!updated) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ member: updated });
  } catch (err) {
    console.error('Update member error:', err);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
