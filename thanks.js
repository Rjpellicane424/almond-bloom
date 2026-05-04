const breathingGuide = document.querySelector('[data-breathing-guide]');
const countNode = document.querySelector('[data-breath-count]');
const phaseNode = document.querySelector('[data-breath-phase]');

if (breathingGuide && countNode && phaseNode) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phases = [
    { label: 'Inhale', duration: 4000 },
    { label: 'Hold', duration: 4000 },
    { label: 'Exhale', duration: 4000 },
  ];
  const cycleDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);

  const easeInOut = (value) => 0.5 - Math.cos(Math.PI * value) / 2;
  const lerp = (start, end, value) => start + (end - start) * value;

  const renderBreath = (elapsed) => {
    let cursor = elapsed % cycleDuration;
    let activePhase = phases[0];
    let phaseStart = 0;

    for (const phase of phases) {
      if (cursor < phase.duration) {
        activePhase = phase;
        break;
      }
      cursor -= phase.duration;
      phaseStart += phase.duration;
    }

    const phaseProgress = cursor / activePhase.duration;
    const eased = easeInOut(phaseProgress);

    let coreScale = 0.72;
    let outerScale = 1;
    let middleScale = 0.78;
    let glowScale = 0.92;
    let glowOpacity = 0.42;

    if (activePhase.label === 'Inhale') {
      coreScale = lerp(0.72, 1, eased);
      outerScale = lerp(0.94, 1.16, eased);
      middleScale = lerp(0.76, 1.02, eased);
      glowScale = lerp(0.9, 1.14, eased);
      glowOpacity = lerp(0.34, 0.5, eased);
    } else if (activePhase.label === 'Hold') {
      const drift = Math.sin((cursor / activePhase.duration) * Math.PI);
      coreScale = 1 + drift * 0.012;
      outerScale = 1.16 + drift * 0.02;
      middleScale = 1.02 + drift * 0.018;
      glowScale = 1.14 + drift * 0.025;
      glowOpacity = 0.5 - drift * 0.04;
    } else {
      coreScale = lerp(1, 0.72, eased);
      outerScale = lerp(1.16, 0.94, eased);
      middleScale = lerp(1.02, 0.76, eased);
      glowScale = lerp(1.14, 0.9, eased);
      glowOpacity = lerp(0.5, 0.34, eased);
    }

    breathingGuide.style.setProperty('--breath-core-scale', coreScale.toFixed(3));
    breathingGuide.style.setProperty('--breath-ring-outer-scale', outerScale.toFixed(3));
    breathingGuide.style.setProperty('--breath-ring-middle-scale', middleScale.toFixed(3));
    breathingGuide.style.setProperty('--breath-glow-scale', glowScale.toFixed(3));
    breathingGuide.style.setProperty('--breath-glow-opacity', glowOpacity.toFixed(3));

    const secondsRemaining = Math.max(1, Math.ceil((activePhase.duration - cursor) / 1000));
    countNode.textContent = String(secondsRemaining);
    phaseNode.textContent = activePhase.label;
  };

  if (prefersReducedMotion) {
    renderBreath(0);
  } else {
    let start;
    const tick = (now) => {
      if (typeof start === 'undefined') {
        start = now;
      }
      renderBreath(now - start);
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  }
}
