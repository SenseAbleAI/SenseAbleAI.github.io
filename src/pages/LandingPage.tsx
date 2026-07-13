import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WEBAPP_DEMO_URL } from '../config';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Ambient gradient backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col px-6 py-14 md:py-20">
        {/* Hero */}
        <header className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-slate-300 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Research demo · EMNLP 2026 System Demonstrations
          </span>
          <h1 className="mt-6 bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent md:text-6xl">
            SenseAble
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300 md:text-xl">
            Adapting, not deleting, sensory-rich text for diverse readers.
          </p>
        </header>

        {/* Primary message */}
        <div className="mx-auto mt-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">A fully working, interactive demo</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300 md:text-base">
                This is a complete, end-to-end running application — you can type any text and get
                real, personalized rewrites. To keep the public deployment lightweight, it is powered
                by a smaller, public-key language model with reduced token usage, rather than the
                higher-capacity model we use internally. Outputs are faithful to the system's
                behavior, just a little lighter.
              </p>
            </div>
          </div>
        </div>

        {/* Availability note */}
        <div className="mx-auto mt-4 w-full max-w-3xl rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-5 py-4">
          <p className="flex items-start gap-3 text-sm text-amber-200/90">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M10.34 3.94l-8.06 13.97A1.5 1.5 0 0 0 3.58 21h16.84a1.5 1.5 0 0 0 1.3-2.09L13.66 3.94a1.5 1.5 0 0 0-2.62 0Z" />
            </svg>
            <span>
              The live app runs on our own GPU servers. If it happens to be unavailable when you
              visit, please explore the version with curated demo examples below — it always works.
            </span>
          </p>
        </div>

        {/* Two links */}
        <div className="mx-auto mt-8 grid w-full max-w-3xl gap-5 md:grid-cols-2">
          {/* Fully running app */}
          <a
            href={WEBAPP_DEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600 to-indigo-600 p-6 shadow-lg shadow-indigo-900/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-800/40"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7Z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Fully running app</h3>
            <p className="mt-1 flex-1 text-sm text-blue-100">
              The live end-to-end system. Enter any text and receive real, personalized adaptive
              rewrites.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              Open the live app
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </a>

          {/* App with demo examples */}
          <button
            onClick={() => navigate('/login')}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-left backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/[0.08]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">App with demo examples</h3>
            <p className="mt-1 flex-1 text-sm text-slate-300">
              Explore SenseAble on curated example texts, running fully in your browser. Always
              available.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-300">
              Open demo examples
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </button>
        </div>

        {/* Footer links */}
        <footer className="mx-auto mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
          <a href="https://github.com/SenseAbleAI/codes" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-slate-200">
            Code
          </a>
          <span className="text-slate-700">·</span>
          <a href="https://youtu.be/A5aEpWKBnvk" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-slate-200">
            Demo video
          </a>
          <span className="text-slate-700">·</span>
          <span>Accessible, meaning-preserving text</span>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
