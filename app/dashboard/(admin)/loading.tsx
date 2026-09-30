export default function DashboardLoading() {
  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-150">
      {/* Header Banner Skeleton */}
      <div className="rounded-3xl bg-slate-200/80 dark:bg-slate-800/50 p-6 sm:p-8 h-28 flex items-center justify-between animate-pulse">
        <div className="space-y-2.5">
          <div className="h-4 w-36 bg-slate-300 dark:bg-slate-700 rounded-full" />
          <div className="h-7 w-64 bg-slate-300 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="hidden sm:block h-10 w-32 bg-slate-300 dark:bg-slate-700 rounded-xl" />
      </div>

      {/* KPI Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-white border border-slate-100 p-5 space-y-3 shadow-xs animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 rounded-full" />
              <div className="w-8 h-8 rounded-xl bg-slate-100" />
            </div>
            <div className="h-7 w-28 bg-slate-200 rounded-md" />
            <div className="h-2.5 w-36 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-xs space-y-4 animate-pulse">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="h-5 w-40 bg-slate-200 rounded-md" />
          <div className="h-9 w-48 bg-slate-100 rounded-xl" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl flex items-center px-4 justify-between"
            >
              <div className="h-3.5 w-1/4 bg-slate-200 rounded-full" />
              <div className="h-3.5 w-1/6 bg-slate-200 rounded-full" />
              <div className="h-3.5 w-1/6 bg-slate-200 rounded-full" />
              <div className="h-6 w-16 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
