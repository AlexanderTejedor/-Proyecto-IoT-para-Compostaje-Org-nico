export default function CircularMetric({
  label,
  value,
  unit,
  max,
  color,
  subtext,
}) {
  const numericVal = parseFloat(value) || 0;
  const percentage = Math.min(Math.max((numericVal / max) * 100, 0), 100);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-slate-800"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className={`${color} transition-all duration-700 ease-out`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-sm font-bold text-white leading-none">
            {value !== null && value !== undefined ? value : "--"}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-200 mt-2 text-center">
        {label}
      </span>
      <span className="text-[10px] text-slate-500 text-center">{subtext}</span>
    </div>
  );
}
