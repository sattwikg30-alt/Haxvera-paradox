import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#040d08] pt-20 pb-10 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent-green/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold tracking-tight inline-block mb-4">
              <span className="text-white">Agri</span>
              <span className="text-accent-green">Go</span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed">
              Precision farming through advanced climate intelligence.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4 tracking-wide">Product</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-text-secondary hover:text-accent-green transition-colors">Features</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary hover:text-accent-green transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary hover:text-accent-green transition-colors">Case Studies</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4 tracking-wide">Company</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-text-secondary hover:text-accent-green transition-colors">About</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary hover:text-accent-green transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary hover:text-accent-green transition-colors">Careers</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4 tracking-wide">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-text-secondary hover:text-accent-green transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary hover:text-accent-green transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-secondary/60">
            © {new Date().getFullYear()} AgriGo Intelligence. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-text-secondary/60 hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="text-text-secondary/60 hover:text-white transition-colors">LinkedIn</Link>
            <Link href="#" className="text-text-secondary/60 hover:text-white transition-colors">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;