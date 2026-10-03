
const HowItWorks = () => {
return (
    <section id="how-it-works" className="py-32 relative overflow-hidden bg-background">
<div className="max-w-7xl mx-auto px-6 relative z-10">
<div className="text-center mb-24">
<motion.div
            initial={{ opacity: 0, y: 15 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary-bg border border-border-green w-fit mb-6"
>
            <span className="text-[10px] font-bold text-accent-green uppercase tracking-[0.2em]">Workflow</span>
</motion.div>
<motion.h2
            initial={{ opacity: 0, y: 15 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter"
>
Simple Process. <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-emerald-400">Pro Results.</span>
</motion.h2>
</div>

<div className="relative">
{/* Animated Connecting line (Desktop) */}
          <div className="hidden md:block absolute top-[48px] left-[12%] w-[76%] h-[1px] bg-white/5 z-0">
<motion.div
              initial={{ scaleX: 0, transformOrigin: "left" }}
              whileInView={{ scaleX: 1 }}
viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
className="h-full bg-gradient-to-r from-transparent via-accent-green to-transparent"
/>
</div>
@@ -69,27 +66,27 @@ const HowItWorks = () => {
{steps.map((step, index) => (
<motion.div
key={index}
                initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
className="flex flex-col items-center text-center group"
>
<div className="relative mb-8">
                  <div className="w-24 h-24 rounded-2xl bg-secondary-bg border border-white/5 flex items-center justify-center text-text-secondary group-hover:text-accent-green group-hover:border-accent-green/30 transition-all duration-300 shadow-xl relative z-10 group-hover:shadow-[0_0_30px_rgba(0,255,136,0.15)] group-hover:-translate-y-1">
                    <step.icon size={32} strokeWidth={2} className="transition-transform duration-300" />
</div>

{/* Step number badge */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-background rounded-full flex items-center justify-center text-xs font-bold text-white border border-white/10 z-20 shadow-lg group-hover:border-accent-green group-hover:text-accent-green transition-colors duration-300">
{index + 1}
</div>
</div>

                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
{step.title}
</h3>
                <p className="text-text-secondary text-[15px] font-light px-4 leading-relaxed">
{step.description}
</p>
</motion.div>