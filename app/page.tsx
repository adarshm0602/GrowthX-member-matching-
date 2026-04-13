import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-white text-gray-900">
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-violet-600 mb-4">
          GrowthX · AI-powered community
        </p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
          India&apos;s most intelligent
          <br />
          professional network
        </h1>
        <p className="mt-6 text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          AI matches you with the right humans based on what you seek and what
          you offer.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
          >
            Join the Community
          </Link>
          <Link
            href="/signin"
            className="px-5 py-2.5 rounded-md border border-gray-300 text-gray-900 text-sm font-medium hover:bg-gray-50"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-500 border border-gray-200 rounded-full px-4 py-2">
          <span className="font-medium text-gray-900">5,500+ members</span>
          <span className="text-gray-300">·</span>
          <span>9% acceptance rate</span>
          <span className="text-gray-300">·</span>
          <span>AI-powered matching</span>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              n: '01',
              title: 'Build your profile',
              body: 'Share your skills, interests, what you are seeking, and what you can offer to the community.',
            },
            {
              n: '02',
              title: 'AI finds your top 5 matches',
              body: 'Claude analyzes every profile and surfaces the five members most likely to create real value for you.',
            },
            {
              n: '03',
              title: 'Start the conversation',
              body: 'Get a personalized, genuine intro message you can send in one click — no cold-open awkwardness.',
            },
          ].map((s) => (
            <div
              key={s.n}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="text-xs font-semibold text-violet-600 tracking-wider mb-3">
                STEP {s.n}
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                {s.title}
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/signup"
            className="inline-block px-5 py-2.5 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
          >
            Join the Community
          </Link>
        </div>
      </section>
    </div>
  );
}
