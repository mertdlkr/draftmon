interface Props {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeLive?: boolean;
  icon?: string;
  count?: string | number;
}

export function PageHeader({ title, subtitle, badge, badgeLive, icon, count }: Props) {
  return (
    <div
      className="w-full border-b-4 border-primary px-6 md:px-10 py-10 relative overflow-hidden"
      style={{
        backgroundColor: "var(--color-bg-light)",
        backgroundImage:
          "repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0,0,0,0.04) 10px, rgba(0,0,0,0.04) 12px)",
      }}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/40 bg-primary/10 text-primary font-pixel text-[8px] uppercase tracking-widest mb-4">
            {badgeLive && <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
            {badge}
          </div>
        )}
        <div className="flex items-center gap-4">
          {icon && (
            <span className="material-symbols-outlined text-primary text-4xl">{icon}</span>
          )}
          <h1 className="font-pixel text-2xl md:text-3xl text-slate-900 uppercase leading-tight">
            {title}
          </h1>
          {count !== undefined && (
            <span className="font-pixel text-[8px] px-2 py-1 border border-primary/40 bg-primary/10 text-primary">
              {count}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="font-body text-xl text-slate-500 mt-3 max-w-2xl">{subtitle}</p>
        )}
      </div>
      <div className="absolute bottom-2 right-6 font-pixel text-[8px] text-primary/30 pointer-events-none select-none">
        ▓▓▓
      </div>
    </div>
  );
}
