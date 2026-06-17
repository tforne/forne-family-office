export default function PortalMediaLoading() {
  return (
    <div className="space-y-6">
      <section className="ffo-portal-dark rounded-[34px] border border-white/8 p-5 sm:p-6 lg:p-7">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <div className="h-3 w-28 rounded-full bg-white/12" />
            <div className="h-10 w-full max-w-[32rem] rounded-2xl bg-white/12" />
            <div className="h-5 w-full max-w-[36rem] rounded-full bg-white/10" />
            <div className="h-5 w-full max-w-[28rem] rounded-full bg-white/10" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 rounded-[24px] border border-white/10 bg-white/8" />
            ))}
          </div>
        </div>
      </section>

      <section className="ffo-portal-card rounded-[32px] p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-[28px] border border-forne-line bg-white">
              <div className="aspect-[4/3] bg-[linear-gradient(135deg,#eaf2fb_0%,#d7e6f7_100%)]" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-24 rounded-full bg-forne-cloud" />
                <div className="h-6 w-full rounded-full bg-forne-cloud" />
                <div className="h-4 w-4/5 rounded-full bg-forne-cloud" />
                <div className="h-4 w-3/5 rounded-full bg-forne-cloud" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
