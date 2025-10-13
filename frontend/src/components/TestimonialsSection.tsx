import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useCallback, useState } from "react";

const testimonials = [
  {
    quote:
      "The quality never wanes. Continuing to offer 925 silver and high-end, quality jewellery at an alarmingly accessible price point.",
    author: "Clash",
    logo: "/placeholder/clash.svg",
  },
  {
    quote:
      "Exceptional craftsmanship and timeless designs that elevate any outfit effortlessly.",
    author: "GQ",
    logo: "/placeholder/gq.svg",
  },
  {
    quote:
      "Refined jewellery that balances luxury and minimalism perfectly.",
    author: "Esquire",
    logo: "/placeholder/esquire.svg",
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Embla for quotes
  const [quoteRef, quoteApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 5000 })]
  );

  const scrollPrev = useCallback(() => {
    if (quoteApi) quoteApi.scrollPrev();
  }, [quoteApi]);

  const scrollNext = useCallback(() => {
    if (quoteApi) quoteApi.scrollNext();
  }, [quoteApi]);

  // Track current quote index
  useEffect(() => {
    if (!quoteApi) return;

    const onSelect = () => {
      const index = quoteApi.selectedScrollSnap();
      setCurrentIndex(index);
    };

    quoteApi.on("select", onSelect);
    onSelect();

    return () => {
      quoteApi.off("select", onSelect);
    };
  }, [quoteApi]);

  return (
    <section className="bg-gray-50 py-12 md:py-20 text-center overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* === Quotes Carousel === */}
        <div className="relative px-16">
          <div className="overflow-hidden" ref={quoteRef}>
            <div className="flex">
              {testimonials.map((t, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] px-6 flex flex-col items-center justify-center min-h-[180px]"
                >
                  <blockquote className="text-lg md:text-xl italic text-gray-800 font-serif max-w-2xl mx-auto">
                    "{t.quote}"
                  </blockquote>
                  <p className="mt-4 font-medium text-gray-700">{t.author}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* === Animated Logo Ribbon === */}
        <div className="mt-12 relative">
          <div className="flex items-center justify-center gap-12 md:gap-16">
            {testimonials.map((t, index) => {
              const isActive = index === currentIndex;
              const isPrev = index === (currentIndex - 1 + testimonials.length) % testimonials.length;
              const isNext = index === (currentIndex + 1) % testimonials.length;
              
              // Calculate position and rotation
              let translateX = 0;
              let opacity = 0.4;
              let scale = 0.75;
              let rotateY = 0;
              
              if (isActive) {
                translateX = 0;
                opacity = 1;
                scale = 1.2;
                rotateY = 0;
              } else if (isPrev) {
                translateX = -120;
                opacity = 0.6;
                scale = 0.85;
                rotateY = -25;
              } else if (isNext) {
                translateX = 120;
                opacity = 0.6;
                scale = 0.85;
                rotateY = 25;
              } else {
                opacity = 0;
                scale = 0.5;
              }

              return (
                <div
                  key={index}
                  className="absolute transition-all duration-700 ease-out"
                  style={{
                    transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                    opacity: opacity,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <img
                    src={t.logo}
                    alt={t.author}
                    className={`h-10 md:h-12 w-auto object-contain transition-all duration-700 ${
                      isActive ? "grayscale-0" : "grayscale"
                    }`}
                    style={{
                      filter: isActive ? 'none' : 'grayscale(100%)',
                    }}
                  />
                </div>
              );
            })}
          </div>
          
          {/* Spacer to maintain height */}
          <div className="h-16 md:h-20"></div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => quoteApi?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-gray-700 w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}