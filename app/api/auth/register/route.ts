import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Member from '@/models/Member';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role,
      title,
      company,
      bio,
      skills,
      interests,
      seeking,
      offering,
      city,
      linkedin,
      github,
    } = body ?? {};

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password, role' },
        { status: 400 }
      );
    }

    if (!['founder', 'professional'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "founder" or "professional"' },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Member.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: 'A member with this email already exists' },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const member = await Member.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role,
      title,
      company,
      bio,
      skills,
      interests,
      seeking,
      offering,
      city,
      linkedin,
      github,
    });

    return NextResponse.json(
      { message: 'Account created', memberId: member._id.toString() },
      { status: 201 }
    );
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
