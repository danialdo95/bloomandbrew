type StatCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="rounded-[6px] border border-[#eadfd4] bg-white p-5 shadow-[0_8px_24px_rgba(64,45,35,0.06)]">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c45572]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-[#211f1d]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[#756b63]">{detail}</p>
    </div>
  );
}
