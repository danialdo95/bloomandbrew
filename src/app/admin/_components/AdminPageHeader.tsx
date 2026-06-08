type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: string;
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  aside,
}: AdminPageHeaderProps) {
  return (
    <section className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-black text-[#211f1d]">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-[#6f6259]">{description}</p>
        </div>
        {aside ? (
          <div className="rounded-[6px] border border-[#eadfd4] bg-[#fff8f2] px-4 py-3 text-right">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#8a7d73]">
              Status
            </p>
            <p className="mt-1 text-sm font-black text-[#211f1d]">{aside}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
