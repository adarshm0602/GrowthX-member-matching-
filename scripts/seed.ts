/* eslint-disable @typescript-eslint/no-var-requires */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load .env.local explicitly (dotenv/config reads .env by default).
require('dotenv').config({ path: '.env.local' });

import Member from '../models/Member';
import Match from '../models/Match';

type SeedMember = {
  name: string;
  email: string;
  password: string;
  role: 'founder' | 'professional';
  title: string;
  company: string;
  bio: string;
  skills: string[];
  interests: string[];
  seeking: string[];
  offering: string[];
  city: string;
  linkedin?: string;
  github?: string;
};

const PASSWORD = 'Password123!';

const members: SeedMember[] = [
  {
    name: 'Aarav Mehta',
    email: 'aarav@example.com',
    role: 'founder',
    title: 'Co-founder & CEO',
    company: 'Lumen AI',
    bio: 'Building a vertical AI copilot for Indian SMBs. Ex-product at Razorpay.',
    skills: ['Product Strategy', 'Go-to-Market', 'Fundraising', 'SQL'],
    interests: ['AI agents', 'SMB software', 'Fintech'],
    seeking: ['Technical co-founder intros', 'Design partners', 'Seed investors'],
    offering: ['GTM playbooks', 'SMB distribution advice', 'Intros to fintech founders'],
    city: 'Bangalore',
    linkedin: 'https://linkedin.com/in/aaravmehta',
    password: '',
  },
  {
    name: 'Isha Reddy',
    email: 'isha@example.com',
    role: 'professional',
    title: 'Senior ML Engineer',
    company: 'Flipkart',
    bio: 'LLM infra and retrieval systems. Previously at AWS Bedrock team.',
    skills: ['LLMs', 'RAG', 'Python', 'PyTorch'],
    interests: ['Agentic systems', 'Evals', 'Startups'],
    seeking: ['Founders to advise', 'Interesting side projects', 'AI research papers'],
    offering: ['ML architecture reviews', 'Hiring ML talent', 'RAG deep-dives'],
    city: 'Bangalore',
    github: 'https://github.com/ishareddy',
    password: '',
  },
  {
    name: 'Rohan Kapoor',
    email: 'rohan@example.com',
    role: 'founder',
    title: 'Founder',
    company: 'Finch',
    bio: 'Creator-economy payments. Bootstrapped to $1M ARR.',
    skills: ['Fintech', 'Payments', 'Product', 'Growth'],
    interests: ['Creator economy', 'Payments', 'B2B SaaS'],
    seeking: ['Senior engineers to hire', 'Design help', 'International expansion advice'],
    offering: ['Bootstrapping lessons', 'Payments domain expertise', 'Intros to creators'],
    city: 'Mumbai',
    password: '',
  },
  {
    name: 'Priya Nair',
    email: 'priya@example.com',
    role: 'professional',
    title: 'Principal Designer',
    company: 'Swiggy',
    bio: 'Design systems and 0→1 product design. Mentor at ADPList.',
    skills: ['Product Design', 'Design Systems', 'Figma', 'User Research'],
    interests: ['Consumer apps', 'Design leadership', 'India-first UX'],
    seeking: ['Early-stage founders to collaborate', 'Design critique partners'],
    offering: ['Design audits', 'Design system guidance', 'Portfolio reviews'],
    city: 'Bangalore',
    linkedin: 'https://linkedin.com/in/priyanair',
    password: '',
  },
  {
    name: 'Karthik Iyer',
    email: 'karthik@example.com',
    role: 'professional',
    title: 'Growth Lead',
    company: 'CRED',
    bio: 'Lifecycle + paid growth. Scaled 3 consumer apps past 10M users.',
    skills: ['Growth', 'Performance Marketing', 'Analytics', 'SQL'],
    interests: ['Consumer', 'Fintech', 'Retention'],
    seeking: ['Founders who need growth help', 'Advisory roles'],
    offering: ['Growth audits', 'Lifecycle playbooks', 'Martech stack advice'],
    city: 'Mumbai',
    password: '',
  },
  {
    name: 'Ananya Singh',
    email: 'ananya@example.com',
    role: 'founder',
    title: 'Co-founder',
    company: 'Verdant Labs',
    bio: 'Climate-tech SaaS for manufacturers. YC W24.',
    skills: ['Enterprise SaaS', 'Sales', 'Climate'],
    interests: ['Climate', 'Manufacturing', 'Enterprise AI'],
    seeking: ['ML engineers', 'Enterprise design partners', 'Climate-aligned investors'],
    offering: ['Enterprise sales know-how', 'YC application feedback', 'Climate network'],
    city: 'Delhi',
    password: '',
  },
  {
    name: 'Vikram Sethi',
    email: 'vikram@example.com',
    role: 'professional',
    title: 'Staff Engineer',
    company: 'Google',
    bio: 'Distributed systems and developer tooling. Open-source maintainer.',
    skills: ['Distributed Systems', 'Go', 'Kubernetes', 'DevTools'],
    interests: ['Infra startups', 'Open source', 'Developer productivity'],
    seeking: ['Startups building devtools', 'Advisory or angel opportunities'],
    offering: ['Systems architecture reviews', 'Hiring pipeline help', 'Infra deep-dives'],
    city: 'Hyderabad',
    github: 'https://github.com/vikramsethi',
    password: '',
  },
  {
    name: 'Neha Joshi',
    email: 'neha@example.com',
    role: 'professional',
    title: 'Product Manager',
    company: 'Zomato',
    bio: 'Consumer PM obsessed with onboarding and activation.',
    skills: ['Product Management', 'Onboarding', 'Experimentation', 'Figma'],
    interests: ['Consumer AI', 'Behavioral design', 'Food tech'],
    seeking: ['Early-stage consumer founders', 'PM peers for case discussions'],
    offering: ['PM mentorship', 'Activation teardowns', 'Experimentation frameworks'],
    city: 'Delhi',
    password: '',
  },
  {
    name: 'Dhruv Patel',
    email: 'dhruv@example.com',
    role: 'founder',
    title: 'Founder & CTO',
    company: 'Parcel',
    bio: 'AI agents for logistics dispatch. Raised pre-seed from Sequoia Surge.',
    skills: ['Python', 'LLM agents', 'Systems Design', 'Hiring'],
    interests: ['Logistics', 'Multi-agent systems', 'B2B AI'],
    seeking: ['Design help', 'Senior ML hires', 'Enterprise intros'],
    offering: ['Agent architecture guidance', 'Surge cohort intros', 'Tech hiring advice'],
    city: 'Bangalore',
    github: 'https://github.com/dhruvp',
    password: '',
  },
  {
    name: 'Meera Rao',
    email: 'meera@example.com',
    role: 'professional',
    title: 'VC Investor',
    company: 'Elevation Capital',
    bio: 'Early-stage investor focused on AI and SaaS. Ex-founder.',
    skills: ['Venture Capital', 'Fundraising', 'Market Research'],
    interests: ['AI', 'SaaS', 'Developer tools', 'Climate'],
    seeking: ['Exceptional founders to back', 'Angel co-invest opportunities'],
    offering: ['Fundraising feedback', 'Investor intros', 'Market mapping'],
    city: 'Delhi',
    linkedin: 'https://linkedin.com/in/meerarao',
    password: '',
  },
  {
    name: 'Siddharth Bose',
    email: 'sid@example.com',
    role: 'founder',
    title: 'Solo Founder',
    company: 'Inkwell',
    bio: 'Building an AI writing tool for Indian authors and journalists.',
    skills: ['Full-stack', 'TypeScript', 'LLMs', 'Product'],
    interests: ['Writing tools', 'Consumer AI', 'Publishing'],
    seeking: ['Design partner', 'Content distribution help', 'Angel cheques'],
    offering: ['Solo-founder playbooks', 'LLM prompt engineering', 'Indie hacking advice'],
    city: 'Hyderabad',
    password: '',
  },
  {
    name: 'Tanvi Shah',
    email: 'tanvi@example.com',
    role: 'professional',
    title: 'Brand Marketing Lead',
    company: 'Boat',
    bio: 'Consumer brand builder. Built campaigns reaching 50M+.',
    skills: ['Brand Marketing', 'Content', 'Influencer', 'Storytelling'],
    interests: ['D2C', 'Consumer AI', 'Creator economy'],
    seeking: ['Early-stage consumer founders', 'Fractional CMO roles'],
    offering: ['Brand positioning sprints', 'Influencer playbooks', 'Launch strategy'],
    city: 'Mumbai',
    password: '',
  },
];

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set. Check .env.local');

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await Member.deleteMany({});
  await Match.deleteMany({});
  console.log('Cleared members and matches collections');

  const hashed = await bcrypt.hash(PASSWORD, 12);

  for (const m of members) {
    const created = await Member.create({ ...m, password: hashed });
    console.log(`  ✓ ${created.name}  (${created._id.toString()})`);
  }

  console.log(`\nSeeded ${members.length} members. Shared password: ${PASSWORD}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
