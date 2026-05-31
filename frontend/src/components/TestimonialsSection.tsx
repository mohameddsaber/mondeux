import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useCallback, useState } from "react";
import { FadeIn } from "./ui/FadeIn";

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
    [Autoplay({ delay: 6000 })]
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
    <section className="bg-background py-24 md:py-32 text-center overflow-hidden border-t border-border">
      <FadeIn>
        <div className="max-w-5xl mx-auto">
          {/* === Quotes Carousel === */}
          <div className="relative px-12 md:px-24">
            <div className="overflow-hidden" ref={quoteRef}>
              <div className="flex">
                {testimonials.map((t, index) => (
                  <div
                    key={index}
                    className="flex-[0_0_100%] px-6 flex flex-col items-center justify-center min-h-[200px]"
                  >
                    <blockquote className="text-2xl md:text-4xl italic text-foreground font-serif leading-relaxed max-w-3xl mx-auto mb-8 tracking-wide">
                      "{t.quote}"
                    </blockquote>
                    <p className="font-sans text-sm tracking-[0.2em] text-muted-foreground uppercase">
                      {t.author}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrows */}
            <button
              onClick={scrollPrev}
              className="absolute left-0 md:left-8 top-1/2 -translate-y-1/2 p-4 text-muted-foreground hover:text-foreground transition-colors duration-500"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-8 h-8 font-light" strokeWidth={1} />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-0 md:right-8 top-1/2 -translate-y-1/2 p-4 text-muted-foreground hover:text-foreground transition-colors duration-500"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-8 h-8 font-light" strokeWidth={1} />
            </button>
          </div>

          {/* === Animated Logo Ribbon === */}
          <div className="mt-16 relative">
            <div className="flex items-center justify-center gap-12 md:gap-20">
              {testimonials.map((t, index) => {
                const isActive = index === currentIndex;
                const isPrev = index === (currentIndex - 1 + testimonials.length) % testimonials.length;
                const isNext = index === (currentIndex + 1) % testimonials.length;
                
                // Calculate position and rotation
                let translateX = 0;
                let opacity = 0.3;
                let scale = 0.8;
                let rotateY = 0;
                
                if (isActive) {
                  translateX = 0;
                  opacity = 1;
                  scale = 1.1;
                  rotateY = 0;
                } else if (isPrev) {
                  translateX = -80;
                  opacity = 0.4;
                  scale = 0.9;
                  rotateY = -15;
                } else if (isNext) {
                  translateX = 80;
                  opacity = 0.4;
                  scale = 0.9;
                  rotateY = 15;
                } else {
                  opacity = 0;
                  scale = 0.6;
                }

                return (
                  <div
                    key={index}
                    className="absolute transition-all duration-1000 ease-out"
                    style={{
                      transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                      opacity: opacity,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="text-xl font-serif text-foreground opacity-50 select-none pointer-events-none tracking-widest uppercase">
                      {/* Using author name as fallback for missing logo SVGs for better presentation */}
                      {t.author}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Spacer to maintain height */}
            <div className="h-16 md:h-20"></div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => quoteApi?.scrollTo(index)}
                className={`h-[1px] transition-all duration-500 ${
                  index === currentIndex
                    ? "bg-foreground w-8"
                    : "bg-border w-4 hover:bg-muted-foreground"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}