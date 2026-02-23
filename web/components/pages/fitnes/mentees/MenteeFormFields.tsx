import React, { useRef, useEffect } from 'react';

interface MenteeFormFieldsProps {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  loading?: boolean;
  error?: string | null;
  children?: React.ReactNode;
}

const MenteeFormFields: React.FC<MenteeFormFieldsProps> = ({
  name,
  setName,
  email,
  setEmail,
  notes,
  setNotes,
  loading,
  error,
  children,
}) => (
  <>
    {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">{error}</div>}
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
          required
          ref={(() => {
            const inputRef = useRef<HTMLInputElement>(null);
            useEffect(() => {
              if (inputRef.current) inputRef.current.focus();
            }, []);
            return inputRef;
          })()}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email (optional)</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
      </div>
      {children}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
          rows={2}
          disabled={loading}
        />
      </div>
    </div>
  </>
);

export default MenteeFormFields;
