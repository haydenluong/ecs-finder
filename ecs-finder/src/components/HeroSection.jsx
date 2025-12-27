function HeroSection() {
    return (
        <>
            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 1s ease-out;
                }
            `}</style>
            
            <section className="relative w-full">
      <div className="relative h-44 sm:h-52 md:h-60 lg:h-72 overflow-hidden bg-gradient-to-br from-hero-navy via-hero-blue to-hero-blue-dark">
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="max-w-4xl text-xl font-bold leading-tight tracking-tight text-black sm:text-2xl md:text-3xl lg:text-4xl animate-fade-in">
            Khám phá ngay những hoạt động ngoại khóa dành riêng cho bạn
          </h1>

          <p
            className="mt-4 text-base font-medium tracking-widest text-white/90 sm:text-lg md:text-xl animate-fade-in"
            style={{ animationDelay: "0.15s" }}
          >
            <span className="inline-block px-2 text-black">Nhanh.</span>
            <span className="inline-block px-2 text-black">Tiện.</span>
            <span className="inline-block px-2 text-black">Dễ dàng.</span>
          </p>
        </div>
      </div>
    </section>
        </>
    );
};

export default HeroSection;