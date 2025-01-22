interface StarConfig {
  numberOfStars: number;
  starSizes: number[];
}

class AnimationService {
  private defaultConfig: StarConfig = {
    numberOfStars: 8,
    starSizes: [30, 40, 50, 60, 70]
  };

  createStars(container: HTMLElement, config: StarConfig = this.defaultConfig) {
    const { numberOfStars, starSizes } = config;

    for (let i = 0; i < numberOfStars; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 15}s`;
      star.style.animationDuration = `${20 + Math.random() * 20}s`;
      
      const size = starSizes[Math.floor(Math.random() * starSizes.length)];
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      star.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1.5C12 1.5 14.5 4.5 16.5 4.5C18.5 4.5 21.5 2 21.5 2C21.5 2 20.5 6 21.5 8C22.5 10 24 12 24 12C24 12 21 13 20 15C19 17 19.5 21.5 19.5 21.5C19.5 21.5 16 19.5 14 19.5C12 19.5 9.5 21.5 9.5 21.5C9.5 21.5 10 17 9 15C8 13 4.5 12 4.5 12C4.5 12 6.5 10 7.5 8C8.5 6 7.5 2 7.5 2C7.5 2 10.5 4.5 12.5 4.5C14.5 4.5 12 1.5 12 1.5Z"/>
        </svg>
      `;
      
      container.appendChild(star);
    }
  }

  initParallax() {
    const handleMouseMove = (e: MouseEvent) => {
      const stars = document.querySelectorAll('.star');
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;

      stars.forEach((star, index) => {
        const speed = 1 + (index % 4) * 1.5;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        (star as HTMLElement).style.transform = 
          `translate(${x * 25}px, ${y * 25}px) rotate(${x * y * 180}deg)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }

  initScrollAnimations() {
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          if (entry.target.classList.contains('features') || 
              entry.target.classList.contains('steps')) {
            const children = Array.from(entry.target.children);
            children.forEach((child, index) => {
              setTimeout(() => {
                (child as HTMLElement).classList.add('visible');
              }, index * 100);
            });
          }
        }
      });
    }, observerOptions);

    return observer;
  }
}

export const animationService = new AnimationService(); 