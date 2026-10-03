
const CTA = () => {
return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* High-perf backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.08)_0%,transparent_60%)] pointer-events-none" />

<div className="max-w-5xl mx-auto px-6 relative z-10">
<motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-150px" }}
           transition={{ duration: 0.6, ease: "easeOut" }}
           className="relative overflow-hidden rounded-3xl p-12 md:p-20 text-center border border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.5)] bg-secondary-bg"
>
          {/* Subtle light effect inside without heavy blur */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.15)_0%,transparent_60%)] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,rgba(0,200,100,0.1)_0%,transparent_60%)] translate-y-1/2 -translate-x-1/3" />

<div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-8">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tighter">
Start predicting your farm’s potential today.
</h2>
            <p className="text-lg md:text-xl text-text-secondary font-light max-w-2xl leading-relaxed">
Join the future of climate-aware agriculture. Make data-driven decisions and maximize your yield effortlessly.
</p>

<motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="mt-6 flex items-center gap-3 bg-accent-green hover:bg-accent-green-hover text-[#000] px-10 py-5 rounded-xl font-bold text-lg transition-colors shadow-[0_0_30px_rgba(0,255,136,0.25)] ring-4 ring-accent-green/20"
>
Create Free Account
              <ArrowRight size={22} strokeWidth={2.5} />
</motion.button>
</div>
</motion.div>