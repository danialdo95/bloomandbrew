type TrendTagsProps = {
  trends: Array<{
    label: string;
    count: number;
  }>;
};

export function TrendTags({ trends }: TrendTagsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {trends.map((trend) => (
        <span
          key={trend.label}
          className="rounded-full border border-[#f1c8d1] bg-[#fff4f6] px-4 py-2 text-sm font-black text-[#211f1d]"
        >
          #{trend.label} <span className="text-[#c45572]">{trend.count}</span>
        </span>
      ))}
    </div>
  );
}
