const header = document.querySelector('.site-header');
const revealTargets = document.querySelectorAll('[data-reveal]');
const loopSteps = document.querySelectorAll('[data-loop-step]');
const timelineSteps = document.querySelectorAll('[data-timeline-step]');
const waitlistForm = document.getElementById('waitlist-form');
const emailInput = document.getElementById('email');
const formStatus = document.getElementById('form-status');
const submitButton = document.getElementById('waitlist-submit');
const waitlistEndpoint = 'https://formsubmit.co/ajax/almondbloom.info@gmail.com';

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

if (waitlistForm && emailInput && formStatus && submitButton) {
  const handleWaitlistSubmit = async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    formStatus.classList.remove('is-error', 'is-success');

    if (!isValidEmail) {
      formStatus.textContent = 'Please enter a valid email address.';
      formStatus.classList.add('is-error');
      return;
    }

    const originalButtonText = submitButton.textContent;
    const formData = new FormData(waitlistForm);
    formData.set('email', email);
    formData.set('submittedAt', new Date().toISOString());

    submitButton.disabled = true;
    submitButton.textContent = 'Joining...';
    formStatus.textContent = 'Sending your waitlist request...';

    try {
      const response = await fetch(waitlistEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Waitlist request failed with status ${response.status}`);
      }
    } catch (error) {
      console.warn('Waitlist submission failed.', error);
      formStatus.textContent = 'Something went wrong. Please try again in a moment.';
      formStatus.classList.add('is-error');
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      return;
    }

    emailInput.value = '';
    formStatus.textContent = "You're on the waitlist. We'll keep you posted.";
    formStatus.classList.add('is-success');

    window.setTimeout(() => {
      window.location.href = './thanks.html';
    }, 200);
  };

  submitButton.addEventListener('click', handleWaitlistSubmit);
  waitlistForm.addEventListener('submit', handleWaitlistSubmit);
  emailInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleWaitlistSubmit(event);
    }
  });
}
