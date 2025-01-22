import { css } from '@emotion/react';

export const animationStyles = css`
  .background-animation {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    overflow: hidden;
  }

  .star {
    position: absolute;
    opacity: 0.15;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    filter: blur(1px);
    
    svg {
      width: 100%;
      height: 100%;
      fill: var(--star-color);
      transition: fill 0.3s ease;
    }

    &:hover {
      opacity: 0.3;
      filter: blur(0);
      svg {
        fill: var(--primary-color);
      }
    }
  }

  .fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), 
                transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .visible {
    opacity: 1;
    transform: translateY(0);
  }

  @keyframes float {
    0% {
      transform: translateY(0) rotate(0deg) scale(1);
    }
    33% {
      transform: translateY(-10px) rotate(120deg) scale(1.05);
    }
    66% {
      transform: translateY(5px) rotate(240deg) scale(0.95);
    }
    100% {
      transform: translateY(0) rotate(360deg) scale(1);
    }
  }

  .star {
    animation: float 20s infinite cubic-bezier(0.4, 0, 0.2, 1);
  }
`; 