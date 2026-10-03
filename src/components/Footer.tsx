
const Footer = () => {
return (
    <footer className="border-t border-white/5 bg-[#020402] pt-20 pb-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-green/20 to-transparent" />
<div className="max-w-7xl mx-auto px-6">
<div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
<div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold tracking-tighter inline-flex items-center mb-4 group">
              <div>
                <span className="text-white">Agri</span>
                <span className="text-accent-green">Go</span>
              </div>
</Link>
            <p className="text-sm text-text-secondary leading-relaxed font-light">
Precision farming through advanced climate intelligence.
</p>
</div>

<div>
            <h4 className="text-white text-sm font-bold mb-6 tracking-wide uppercase">Product</h4>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-sm text-text-secondary hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary hover:text-white transition-colors">Case Studies</Link></li>
</ul>
</div>

<div>
            <h4 className="text-white text-sm font-bold mb-6 tracking-wide uppercase">Company</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm text-text-secondary hover:text-white transition-colors">About</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary hover:text-white transition-colors">Careers</Link></li>
</ul>
</div>

<div>
            <h4 className="text-white text-sm font-bold mb-6 tracking-wide uppercase">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm text-text-secondary hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary hover:text-white transition-colors">Terms of Service</Link></li>
</ul>
</div>
</div>

<div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary/60">
© {new Date().getFullYear()} AgriGo Intelligence. All rights reserved.
</p>
<div className="flex items-center gap-6">
            <Link href="#" className="text-xs font-semibold text-text-secondary hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="text-xs font-semibold text-text-secondary hover:text-white transition-colors">LinkedIn</Link>
            <Link href="#" className="text-xs font-semibold text-text-secondary hover:text-white transition-colors">GitHub</Link>
</div>
</div>
</div>