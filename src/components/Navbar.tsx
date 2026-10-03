
const Navbar = () => {
return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-navbar transition-all duration-300 border-b border-white/5">
<div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
{/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center group">
          <div>
            <span className="text-white">Agri</span>
            <span className="text-accent-green drop-shadow-[0_0_10px_rgba(0,255,136,0.4)]">Go</span>
          </div>
</Link>

{/* Navigation Links */}
<div className="hidden md:flex items-center gap-8">
<Link
href="#features"
            className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
>
Features
</Link>
<Link
href="#how-it-works"
            className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
>
How it works
</Link>
<Link
            href="/signin"
            className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
>
Login
</Link>
<Link
            href="/signup"
            className="rounded-lg px-5 py-2.5 bg-accent-green hover:bg-accent-green-hover text-[#000] text-sm font-bold transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] hover:-translate-y-0.5"
>
Get Started
</Link>
</div>

        {/* Mobile menu icon */}
<div className="md:hidden">
<button className="text-white p-2">
<svg