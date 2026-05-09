"use client";

import { useMemo, useState } from "react";

type PollCardProps = {
  id: string;
  question: string;
  options: string[];
};

export function PollCard({ id, question, options }: PollCardProps) {
  const storageKey = `bloom-brew-poll-${id}`;
  const [selected, setSelected] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(storageKey);
  });

  const results = useMemo(() => {
    return options.map((option, index) => ({
      option,
      percent: selected ? 46 - index * 9 + (selected === option ? 12 : 0) : 0,
    }));
  }, [options, selected]);

  function vote(option: string) {
    setSelected(option);
    window.localStorage.setItem(storageKey, option);
  }

  return (
    <div className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
        Community Poll
      </p>
      <h3 className="mt-3 text-xl font-black text-[#211f1d]">{question}</h3>

      <div className="mt-5 space-y-3">
        {results.map((result) => (
          <button
            key={result.option}
            type="button"
            onClick={() => vote(result.option)}
            className="w-full rounded-[6px] border border-[#eadfd4] bg-[#fffaf6] p-3 text-left transition hover:border-[#c45572]"
          >
            <span className="flex items-center justify-between gap-4 text-sm font-black text-[#211f1d]">
              {result.option}
              {selected ? <span>{Math.max(result.percent, 4)}%</span> : null}
            </span>
            {selected ? (
              <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[#f0ded4]">
                <span
                  className="block h-full rounded-full bg-[#f7c6cf]"
                  style={{ width: `${Math.max(result.percent, 4)}%` }}
                />
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
