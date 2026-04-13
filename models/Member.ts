import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMember extends Document {
  name: string;
  email: string;
  password: string;
  role: 'founder' | 'professional';
  title?: string;
  company?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  seeking?: string[];
  offering?: string[];
  city?: string;
  linkedin?: string;
  github?: string;
  createdAt: Date;
}

const MemberSchema = new Schema<IMember>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['founder', 'professional'], required: true },
  title: { type: String },
  company: { type: String },
  bio: { type: String },
  skills: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  seeking: { type: [String], default: [] },
  offering: { type: [String], default: [] },
  city: { type: String },
  linkedin: { type: String },
  github: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Member: Model<IMember> =
  (mongoose.models.Member as Model<IMember>) ||
  mongoose.model<IMember>('Member', MemberSchema);

export default Member;
