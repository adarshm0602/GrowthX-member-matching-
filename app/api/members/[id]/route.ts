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

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const member = await Member.findById(params.id).select('-password').lean();
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (err) {
    console.error('Get member error:', err);
    return NextResponse.json(
      { error: 'Failed to load member' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (userId !== params.id) {
      return NextResponse.json(
        { error: 'You can only update your own profile' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const update: Record<string, unknown> = {};
    for (const k of EDITABLE_FIELDS) {
      if (k in body) update[k] = body[k];
    }

    await connectDB();

    const updated = await Member.findByIdAndUpdate(params.id, update, {
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
