import React from 'react';
import { Link } from 'react-router-dom';

const SETUP_DOCS_URL = 'README.md';

type EnvSetupErrorPageProps = {
  missingVars: string[];
};

const EnvSetupErrorPage: React.FC<EnvSetupErrorPageProps> = ({ missingVars }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl shadow-black/5 p-8 w-full max-w-xl border border-slate-200 dark:border-border-dark">
        <div className="mx-auto mb-5 flex items-center justify-center size-14 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center">
          Setup required
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
          One or more environment variables are missing. Update your .env file and restart the app.
        </p>
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Missing variables</p>
          <ul className="space-y-2">
            {missingVars.map((variable) => (
              <li
                key={variable}
                className="rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-700 dark:text-rose-200"
              >
                {variable}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            className="w-full sm:w-auto bg-slate-900 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-800 transition"
            href={SETUP_DOCS_URL}
          >
            Open setup docs
          </a>
          <Link
            to="/"
            className="w-full sm:w-auto bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary/90 transition shadow-lg shadow-primary/20 text-center"
          >
            Reload
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EnvSetupErrorPage;
