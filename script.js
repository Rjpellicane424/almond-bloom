const header = document.querySelector('.site-header');
const revealTargets = document.querySelectorAll('[data-reveal]');
const loopSteps = document.querySelectorAll('[data-loop-step]');
const timelineSteps = document.querySelectorAll('[data-timeline-step]');

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
};

setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 },
);

revealTargets.forEach((element) => {
  const top = element.getBoundingClientRect().top;
  if (top < window.innerHeight * 0.92) {
    element.classList.add('is-visible');
    return;
  }

  revealObserver.observe(element);
});

let activeStep = 0;
const cycleSteps = () => {
  loopSteps.forEach((step, index) => {
    step.classList.toggle('is-active', index === activeStep);
  });

  timelineSteps.forEach((step, index) => {
    step.classList.toggle('is-active', index === activeStep);
  });

  activeStep = (activeStep + 1) % Math.max(loopSteps.length, timelineSteps.length, 1);
};

if (loopSteps.length > 0) {
  cycleSteps();
  window.setInterval(cycleSteps, 2600);
}
