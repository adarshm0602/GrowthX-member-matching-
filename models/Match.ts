import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMatchEntry {
  matchedMemberId: Types.ObjectId;
  score: number;
  reasoning: string;
  outreachDraft: string;
}

export interface IMatch extends Document {
  memberId: Types.ObjectId;
  matches: IMatchEntry[];
  generatedAt: Date;
}

const MatchEntrySchema = new Schema<IMatchEntry>(
  {
    matchedMemberId: { type: Schema.Types.ObjectId, ref: 'Member' },
    score: { type: Number, min: 0, max: 100 },
    reasoning: { type: String },
    outreachDraft: { type: String, default: '' },
  },
  { _id: false }
);

const MatchSchema = new Schema<IMatch>({
  memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  matches: { type: [MatchEntrySchema], default: [] },
  generatedAt: { type: Date, default: Date.now },
});

const Match: Model<IMatch> =
  (mongoose.models.Match as Model<IMatch>) ||
  mongoose.model<IMatch>('Match', MatchSchema);

export default Match;
