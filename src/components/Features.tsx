"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { CloudRain, BarChart, Sprout, ChevronLeft, ChevronRight } from "lucide-react";

const features = [
  {
    title: "Advanced Climate Intelligence",
    description: "Our AI engine correlates decades of historical rainfall, temperature, and seasonal shifts with real-time satellite data to predict optimal planting windows and growth cycles with unprecedented accuracy.",
    icon: CloudRain,
    colSpan: "md:col-span-2",
    delay: 0.1,
  },
  {
    title: "Yield Risk Forecaster",
    description: "Visualize potential yield variations and financial impacts before committing resources. Mitigate risks effectively.",
    icon: BarChart,
    colSpan: "col-span-1",
    delay: 0.2,
  },
  {
    title: "Actionable Recommendations",
    description: "Receive practical, day-by-day advice on irrigation, fertilization, and harvesting perfectly tailored to your land.",
    icon: Sprout,
    colSpan: "col-span-1",
    delay: 0.3,
  },
];

const FeatureCard = ({ feature, index, scrollContainerRef, hoveredIndex, setHoveredIndex, hoveredOrigin, setHoveredOrigin }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { root: scrollContainerRef, amount: 0.6 });
  const isHovered = hoveredIndex === index;

  const handleHoverStart = () => {
    if (!isInView) return;
    setHoveredIndex(index);

    if (cardRef.current && scrollContainerRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      const threshold = 100; // pixels from the edge

      if (cardRect.left - containerRect.left < threshold) {
        setHoveredOrigin(0); // Pinned left edge, expands right
      } else if (containerRect.right - cardRect.right < threshold) {
        setHoveredOrigin(1); // Pinned right edge, expands left
      } else {
        setHoveredOrigin(0.5); // Center expansion
      }
    }
  };

  const handleHoverEnd = () => {
    if (hoveredIndex === index) {
      setHoveredIndex(null);
    }
  };

  // Determine translation for adjacent cards to move aside smoothly
  let translateX = 0;
  if (hoveredIndex !== null && !isHovered) {
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    const growthCenter = isDesktop ? 75 : 51; // 1.3 scale difference / 2
    const growthEdge = isDesktop ? 150 : 102; // full 1.3 scale difference

    if (index < hoveredIndex) {
      if (hoveredOrigin === 1) translateX = -growthEdge;
      else if (hoveredOrigin === 0.5) translateX = -growthCenter;
    } else if (index > hoveredIndex) {
      if (hoveredOrigin === 0) translateX = growthEdge;
      else if (hoveredOrigin === 0.5) translateX = growthCenter;
    }
  }

  const originX = isHovered ? hoveredOrigin : 0.5;

  return (
    <motion.div
      ref={cardRef}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      style={{ originX }}
      animate={{
        scale: isHovered && isInView ? 1.3 : 1,
        y: isHovered && isInView ? -20 : 0,
        x: translateX
      }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      className={`min-w-[340px] md:min-w-[500px] h-[260px] md:h-[320px] relative rounded-2xl overflow-hidden flex-shrink-0 transition-opacity duration-500 ${isInView ? "cursor-pointer group hover:z-50 opacity-100" : "cursor-default opacity-80"}`}
    >
      {/* Image */}
      <img
        src={`/feature-${index + 1}.jpg`}
        alt="feature"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition duration-300" />

      {/* Content */}
      <div className="absolute bottom-0 p-6 z-10 transition-all duration-300 group-hover:bottom-6">
        
        <div className="mb-3 p-2 bg-white/20 backdrop-blur-sm rounded-lg w-fit text-white">
          <feature.icon size={20} />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          {feature.title}
        </h3>

        <p className="text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition duration-300">
          {feature.description}
        </p>

      </div>
    </motion.div>
  );
};

const Features = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Shared hover state to coordinate card sliding
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredOrigin, setHoveredOrigin] = useState<number>(0.5);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDown.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // speed
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth + 50 : scrollLeft + clientWidth - 50;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section id="features" className="py-32 relative bg-[#f6f8f5]">
      {/* Background image overlay */}
      <div 
        className="absolute inset-0 w-full h-full opacity-90 pointer-events-none"
        style={{ backgroundImage: "url('/feature-bg.webp')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}
      />
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Section Heading */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-4">
            Platform Capabilities
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Farming powered by{" "}
            <span className="text-green-600">Precision</span>
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We transform complex meteorological and soil data into clear, profitable decisions for your farm.
          </p>
        </div>

        {/* Feature Sections */}
        <div className="relative w-full">
          
          {/* Navigation Arrows */}
          <button 
            onClick={() => scroll("left")} 
            className="absolute left-4 md:-left-8 top-1/2 -translate-y-1/2 z-40 p-4 bg-white text-green-700 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-110 hover:bg-green-50 transition-all border border-gray-100 hidden md:block"
          >
            <ChevronLeft size={28} />
          </button>

          <button 
            onClick={() => scroll("right")} 
            className="absolute right-4 md:-right-8 top-1/2 -translate-y-1/2 z-40 p-4 bg-white text-green-700 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-110 hover:bg-green-50 transition-all border border-gray-100 hidden md:block"
          >
            <ChevronRight size={28} />
          </button>
      
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="relative flex gap-12 md:gap-24 overflow-hidden pt-24 pb-24 -mt-24 px-8 -mx-8"
          >
            {features.map((feature, index) => (
              <FeatureCard 
                key={index} 
                feature={feature} 
                index={index} 
                scrollContainerRef={scrollRef} 
                hoveredIndex={hoveredIndex}
                setHoveredIndex={setHoveredIndex}
                hoveredOrigin={hoveredOrigin}
                setHoveredOrigin={setHoveredOrigin}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;