import React from "react";

// All cred to Ethan! https://codepen.io/ethancopping/pen/ExrGYGG
const init = (containerEl) => {
  const particlesPerThousandPixels = 0.02;
  const fallSpeed = 0.15;
  const pauseWhenNotActive = true;
  const maxSnowflakes = 200;
  const snowflakes = [];

  let snowflakeInterval;
  let isTabActive = true;

  function resetSnowflake(snowflake) {
    const size = Math.random() * 4 + 1;
    const viewportWidth = window.innerWidth - size; // Adjust for snowflake size
    const viewportHeight = window.innerHeight;

    snowflake.style.width = `${size}px`;
    snowflake.style.height = `${size}px`;
    snowflake.style.left = `${Math.random() * viewportWidth}px`; // Constrain within viewport width
    snowflake.style.top = `-${size}px`;

    const animationDuration = (Math.random() * 3 + 2) / fallSpeed;
    snowflake.style.setProperty("--snow-duration", `${animationDuration}s`);

    // Toggle between animations via classes
    if (Math.random() < 0.5) {
      snowflake.classList.remove("animate-diagonal-fall");
      snowflake.classList.add("animate-fall");
    } else {
      snowflake.classList.remove("animate-fall");
      snowflake.classList.add("animate-diagonal-fall");
    }

    setTimeout(() => {
      if (parseInt(snowflake.style.top, 10) < viewportHeight) {
        resetSnowflake(snowflake);
      } else {
        snowflake.remove(); // Remove when it goes off the bottom edge
      }
    }, animationDuration * 1000);
  }

  function createSnowflake() {
    if (snowflakes.length < maxSnowflakes) {
      const snowflake = document.createElement("div");
      snowflake.className = [
        "snowflake",
        "absolute",
        "rounded-full",
        "opacity-80",
        "pointer-events-none",
        "bg-neutral-300",
        "dark:bg-neutral-500",
      ].join(" ");
      snowflakes.push(snowflake);
      containerEl.appendChild(snowflake);
      resetSnowflake(snowflake);
    }
  }

  function generateSnowflakes() {
    const numberOfParticles =
      Math.ceil((window.innerWidth * window.innerHeight) / 1000) *
      particlesPerThousandPixels;
    const interval = 5000 / numberOfParticles;

    clearInterval(snowflakeInterval);
    snowflakeInterval = setInterval(() => {
      if (isTabActive && snowflakes.length < maxSnowflakes) {
        requestAnimationFrame(createSnowflake);
      }
    }, interval);
  }

  function handleVisibilityChange() {
    if (!pauseWhenNotActive) return;

    isTabActive = !document.hidden;
    if (isTabActive) {
      generateSnowflakes();
    } else {
      clearInterval(snowflakeInterval);
    }
  }

  generateSnowflakes();

  window.addEventListener("resize", () => {
    clearInterval(snowflakeInterval);
    setTimeout(generateSnowflakes, 1000);
  });

  document.addEventListener("visibilitychange", handleVisibilityChange);
};

const SnowOverlay = () => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) init(ref.current);
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden w-screen h-screen z-[99999] pointer-events-none"
      ref={ref}
    />
  );
};

export default SnowOverlay;
