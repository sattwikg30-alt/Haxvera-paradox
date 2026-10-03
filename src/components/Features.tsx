const Features = () => {
return (
<section id="features" className="py-32 relative">

<div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
<motion.div
            initial={{ opacity: 0, y: 15 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary-bg border border-border-green w-fit mb-6"
>
            <span className="text-[10px] font-bold text-accent-green uppercase tracking-[0.2em]">Platform Capabilities</span>
</motion.div>
<motion.h2
            initial={{ opacity: 0, y: 15 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter leading-tight"
>
Farming powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-emerald-400">Precision</span>
</motion.h2>
<motion.p
            initial={{ opacity: 0, y: 15 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ delay: 0.2 }}
            className="text-text-secondary max-w-2xl mx-auto text-lg font-light leading-relaxed"
>
We transform complex meteorological and soil data into clear, profitable decisions for your farm.
</motion.p>
{features.map((feature, index) => (
<motion.div
key={index}
              initial={{ opacity: 0, y: 30 }}
              initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: feature.delay }}
              className={`group relative glow-box glass p-10 rounded-[2rem] overflow-hidden ${feature.colSpan}`}
              transition={{ duration: 0.5, delay: feature.delay }}
              className={`group relative glass p-10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-accent-green/30 hover:bg-white/[0.02] ${feature.colSpan}`}
>
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                <feature.icon size={160} />
              {/* Subtle hover gradient, no laggy blur */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-green/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none" />

              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                <feature.icon size={180} />
</div>

<div className="relative z-10">
                <div className="mb-8 p-4 bg-[#0b1a11]/80 border border-white/5 w-fit rounded-2xl text-accent-green shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300">
                  <feature.icon size={32} />
                <div className="mb-8 p-3.5 bg-background border border-white/5 w-fit rounded-xl text-accent-green shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:border-accent-green/20 group-hover:shadow-[0_0_30px_rgba(0,255,136,0.15)] transition-all duration-300">
                  <feature.icon size={26} strokeWidth={2.5} />
</div>
                <h3 className="text-2xl font-bold text-white mb-4">
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
{feature.title}
</h3>
                <p className="text-text-secondary leading-relaxed text-lg max-w-2xl font-light">
                <p className="text-text-secondary leading-relaxed text-[17px] max-w-2xl font-light">
{feature.description}
</p>
</div>
</motion.div>
))}
</div>
</div>
</section>
);
};
