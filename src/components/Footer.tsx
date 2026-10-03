import Link from "next/link";
import { ArrowRight, ChevronRight, MapPin, Phone, Mail, Leaf } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-[#01754C] text-white pt-24 pb-12 overflow-hidden border-t-8 border-[#A5CE00]">
      {/* --- Abstract "Paintings" / Decorative SVG Backgrounds --- */}
      {/* Huge subtle glow blobs for depth */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#E0D203] rounded-full mix-blend-screen opacity-10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-60 w-[700px] h-[700px] bg-[#A5CE00] rounded-full mix-blend-screen opacity-15 blur-[120px] pointer-events-none" />
      
      {/* Curved SVG Painting overlay 1 */}
      <svg className="absolute bottom-0 left-0 w-full h-auto text-[#016540] pointer-events-none z-0" viewBox="0 0 1440 320" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,256L48,229.3C96,203,192,149,288,144C384,139,480,181,576,197.3C672,213,768,203,864,170.7C960,139,1056,85,1152,69.3C1248,53,1344,75,1392,85.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
      {/* Curved SVG Painting overlay 2 */}
      <svg className="absolute top-0 right-0 w-3/4 h-auto text-[#028b5b] pointer-events-none z-0 opacity-40 mix-blend-lighten" viewBox="0 0 1440 320" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,192L80,197.3C160,203,320,213,480,192C640,171,800,117,960,106.7C1120,96,1280,128,1360,144L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
      </svg>
      {/* ------------------------------------------------------------ */}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          
          {/* Brand & Contact Column */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-[#A5CE00] group-hover:border-[#E0D203] transition-all duration-300 shadow-[0_0_20px_rgba(165,206,0,0.3)] backdrop-blur-sm">
                <Leaf className="text-[#E0D203] group-hover:text-[#01754C] transition-colors" size={24} />
              </div>
              <span className="text-4xl font-black tracking-tighter text-white">
                Hax<span className="text-[#A5CE00]">vera</span>
              </span>
            </Link>
            <p className="text-[15px] text-white/90 leading-relaxed font-light mb-10 max-w-sm drop-shadow-md">
              Cultivating the future with sustainable farming. Experience precision agriculture with AI-powered analytics today.
            </p>
            
            {/* Extended Icon Contact Details */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4 text-white group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-black/20 border border-white/10 flex items-center justify-center group-hover:bg-[#E0D203] group-hover:border-[#E0D203] transition-all duration-300 shadow-md">
                  <MapPin size={18} className="text-[#A5CE00] group-hover:text-[#01754C] transition-colors" />
                </div>
                <span className="text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity">123 Greenfield Road, Kansas</span>
              </div>
              <div className="flex items-center gap-4 text-white group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-black/20 border border-white/10 flex items-center justify-center group-hover:bg-[#E0D203] group-hover:border-[#E0D203] transition-all duration-300 shadow-md">
                  <Phone size={18} className="text-[#A5CE00] group-hover:text-[#01754C] transition-colors" />
                </div>
                <span className="text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity">+1 (800) GROW-NOW</span>
              </div>
              <div className="flex items-center gap-4 text-white group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-black/20 border border-white/10 flex items-center justify-center group-hover:bg-[#E0D203] group-hover:border-[#E0D203] transition-all duration-300 shadow-md">
                  <Mail size={18} className="text-[#A5CE00] group-hover:text-[#01754C] transition-colors" />
                </div>
                <span className="text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity">hello@haxvera.com</span>
              </div>
            </div>
          </div>

          {/* Links Space */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:pl-10">
            {/* Product Column */}
            <div className="bg-black/10 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl">
              <h4 className="text-[#A5CE00] text-sm font-black mb-6 tracking-[0.1em] uppercase flex items-center gap-2">
                <ChevronRight size={16} className="text-[#E0D203]" />
                Product
              </h4>
              <ul className="space-y-4">
                <li><Link href="#features" className="text-[15px] font-medium text-white/80 hover:text-[#E0D203] transition-colors flex items-center gap-2 group"><span className="w-0 h-[2px] bg-[#E0D203] transition-all group-hover:w-4"></span>Platform Features</Link></li>
                <li><Link href="#" className="text-[15px] font-medium text-white/80 hover:text-[#E0D203] transition-colors flex items-center gap-2 group"><span className="w-0 h-[2px] bg-[#E0D203] transition-all group-hover:w-4"></span>Pricing Plans</Link></li>
                <li><Link href="#" className="text-[15px] font-medium text-white/80 hover:text-[#E0D203] transition-colors flex items-center gap-2 group"><span className="w-0 h-[2px] bg-[#E0D203] transition-all group-hover:w-4"></span>Case Studies</Link></li>
                <li><Link href="#" className="text-[15px] font-medium text-white/80 hover:text-[#E0D203] transition-colors flex items-center gap-2 group"><span className="w-0 h-[2px] bg-[#E0D203] transition-all group-hover:w-4"></span>Farmer Network</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="bg-black/10 backdrop-blur-md rounded-2xl p-6 border border-white/5 shadow-xl">
              <h4 className="text-[#A5CE00] text-sm font-black mb-6 tracking-[0.1em] uppercase flex items-center gap-2">
                <ChevronRight size={16} className="text-[#E0D203]" />
                Company
              </h4>
              <ul className="space-y-4">
                <li><Link href="#" className="text-[15px] font-medium text-white/80 hover:text-[#E0D203] transition-colors flex items-center gap-2 group"><span className="w-0 h-[2px] bg-[#E0D203] transition-all group-hover:w-4"></span>Our Mission</Link></li>
                <li><Link href="#" className="text-[15px] font-medium text-white/80 hover:text-[#E0D203] transition-colors flex items-center gap-2 group"><span className="w-0 h-[2px] bg-[#E0D203] transition-all group-hover:w-4"></span>Latest Journal</Link></li>
                <li><Link href="#" className="text-[15px] font-medium text-white/80 hover:text-[#E0D203] transition-colors flex items-center gap-2 group"><span className="w-0 h-[2px] bg-[#E0D203] transition-all group-hover:w-4"></span>Careers / Hiring</Link></li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div className="bg-[#026643] rounded-2xl p-6 border border-[#A5CE00]/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E0D203] rounded-full blur-[50px] opacity-20 pointer-events-none" />
              <h4 className="text-white text-sm font-black mb-4 tracking-[0.1em] uppercase drop-shadow-md">
                Stay Updated
              </h4>
              <p className="text-sm text-white/80 mb-6 font-light">
                Join 10,000+ farmers receiving our weekly climate intel.
              </p>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="name@farm.com"
                  className="w-full bg-black/20 border border-white/20 rounded-xl px-5 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:border-[#E0D203] transition-colors shadow-inner"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#A5CE00] rounded-lg flex items-center justify-center text-[#01754C] hover:bg-[#E0D203] transition-colors shadow-md">
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <p className="text-xs font-medium text-white/70">
            © {new Date().getFullYear()} Haxvera Intelligence. All rights globally reserved.
          </p>
          
          <div className="flex items-center gap-4">
            {/* Decorative Link Pills */}
            <Link href="#" className="px-5 py-2 rounded-full bg-black/20 border border-white/10 text-xs font-bold tracking-wide text-white/80 hover:text-[#01754C] hover:border-[#E0D203] hover:bg-[#E0D203] transition-all duration-300 shadow-md">
              Privacy
            </Link>
            <Link href="#" className="px-5 py-2 rounded-full bg-black/20 border border-white/10 text-xs font-bold tracking-wide text-white/80 hover:text-[#01754C] hover:border-[#A5CE00] hover:bg-[#A5CE00] transition-all duration-300 shadow-md">
              Terms
            </Link>
            <Link href="#" className="px-5 py-2 rounded-full bg-black/20 border border-white/10 text-xs font-bold tracking-wide text-white/80 hover:text-[#01754C] hover:border-white hover:bg-white transition-all duration-300 shadow-md">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;