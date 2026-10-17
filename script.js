(() => {
  const wedding = window.WEDDING || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Inject all content from config.js so each couple's details are easy to change.
  $$('[data-config]').forEach((el) => {
    const key = el.dataset.config;
    if (wedding[key] !== undefined && wedding[key] !== '') el.textContent = wedding[key];
  });
  $$('[data-config-image]').forEach((img) => {
    const key = img.dataset.configImage;
    if (wedding[key]) img.src = wedding[key];
  });
  $$('[data-config-href]').forEach((link) => {
    const key = link.dataset.configHref;
    if (wedding[key]) link.href = wedding[key];
  });
  const titleNames = wedding.coupleDisplay || `${wedding.firstName || 'Our'} & ${wedding.secondName || 'Wedding'}`;
  document.title = `${titleNames} — Wedding Invitation`;
  const desc = $('meta[name="description"]');
  if (desc) desc.content = `You're invited to celebrate ${titleNames}. Open the digital wedding invitation for details and RSVP.`;
  const ogTitle = $('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = `${titleNames} — Wedding Invitation`;

  // Open the invitation cover and reveal the page.
  const cover = $('#intro-cover');
  const content = $('.invitation-content');
  const openButton = $('#open-invitation');
  openButton?.addEventListener('click', () => {
    cover.classList.add('is-opening');
    content.classList.remove('is-locked');
    document.body.classList.add('invitation-open');
    window.setTimeout(() => {
      cover.hidden = true;
      $('#home')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
  });

  // Mobile navigation.
  const menuToggle = $('#menu-toggle');
  const nav = $('#site-nav');
  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    nav.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('nav-is-open', !isOpen);
  });
  $$('.site-nav a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('nav-is-open');
  }));

  // Countdown, based on the wedding date and local browser time.
  const target = Date.parse(wedding.weddingDateISO || '2027-06-12T16:00:00+08:00');
  const pad = (n) => String(n).padStart(2, '0');
  function updateCountdown() {
    const remaining = Math.max(0, target - Date.now());
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    $('#days').textContent = String(days).padStart(3, '0');
    $('#hours').textContent = pad(hours);
    $('#minutes').textContent = pad(minutes);
    $('#seconds').textContent = pad(seconds);
    if (remaining <= 0) $('.countdown-wrap .countdown-intro p').innerHTML = 'TODAY IS THE DAY<br><strong>LET’S CELEBRATE</strong>';
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  // If stock photography cannot load, preserve the layout and show a tasteful fallback.
  $$('img').forEach((img) => img.addEventListener('error', () => {
    img.classList.add('image-unavailable');
    img.alt = img.alt || 'Image preview';
  }, { once: true }));

  // Gallery lightbox, including keyboard and arrow-button navigation.
  const galleryButtons = $$('.gallery-photo');
  const galleryData = galleryButtons.map((button) => ({
    src: $('img', button)?.src || '',
    alt: $('img', button)?.alt || 'Wedding gallery photo',
    caption: $('.gallery-caption', button)?.textContent || ''
  }));
  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightbox-image');
  const lightboxCaption = $('#lightbox-caption');
  let currentPhoto = 0;
  let previousFocus = null;
  function showPhoto(index) {
    currentPhoto = (index + galleryData.length) % galleryData.length;
    const photo = galleryData[currentPhoto];
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.alt;
    lightboxCaption.textContent = photo.caption;
  }
  function openPhoto(index) {
    if (!galleryData.length) return;
    previousFocus = document.activeElement;
    showPhoto(index);
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    $('#lightbox-close').focus();
  }
  function closePhoto() {
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
    previousFocus?.focus?.();
  }
  galleryButtons.forEach((button, i) => button.addEventListener('click', () => openPhoto(i)));
  $('#lightbox-close').addEventListener('click', closePhoto);
  $('#lightbox-prev').addEventListener('click', () => showPhoto(currentPhoto - 1));
  $('#lightbox-next').addEventListener('click', () => showPhoto(currentPhoto + 1));
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closePhoto(); });
  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closePhoto();
    if (event.key === 'ArrowLeft') showPhoto(currentPhoto - 1);
    if (event.key === 'ArrowRight') showPhoto(currentPhoto + 1);
  });

  // RSVP: opens a prefilled WhatsApp chat or email when configured.
  const form = $('#rsvp-form');
  const feedback = $('#form-feedback');
  const toast = $('#toast');
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    feedback.textContent = '';
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const attendance = String(data.get('attendance') || '');
    const guests = String(data.get('guests') || '1');
    const note = String(data.get('note') || '').trim();
    if (!name || !attendance) {
      feedback.textContent = 'Please add your name and choose an attendance option.';
      return;
    }
    const lines = [
      `Wedding RSVP — ${titleNames}`,
      `Name: ${name}`,
      `Email: ${email || 'Not provided'}`,
      `Response: ${attendance}`,
      `Number of guests: ${guests}`,
      `Note: ${note || 'None'}`
    ];
    const message = lines.join('\n');
    const whatsapp = String(wedding.rsvpWhatsAppNumber || '').replace(/\D/g, '');
    if (whatsapp) {
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
      feedback.textContent = 'Your RSVP message is ready in WhatsApp. Please press Send there to confirm your response.';
    } else if (wedding.rsvpEmail) {
      window.location.href = `mailto:${encodeURIComponent(wedding.rsvpEmail)}?subject=${encodeURIComponent(`Wedding RSVP — ${titleNames}`)}&body=${encodeURIComponent(message)}`;
      feedback.textContent = 'Your RSVP email draft is ready. Please send it to confirm your response.';
    } else {
      feedback.textContent = 'Demo mode: your RSVP is not sent or stored yet. Add rsvpWhatsAppNumber or rsvpEmail in config.js to receive responses.';
      showToast('RSVP form is ready — connect a WhatsApp number or email in config.js.');
    }
  });

  // Create a downloadable calendar event (.ics) using the wedding date configuration.
  const calendarButton = document.createElement('a');
  calendarButton.className = 'floating-calendar';
  calendarButton.href = '#details';
  calendarButton.textContent = '＋ Add to calendar';
  calendarButton.setAttribute('aria-label', 'Add wedding date to calendar');
  // A restrained floating helper appears after the cover has been opened.
  calendarButton.addEventListener('click', (event) => {
    event.preventDefault();
    const start = new Date(target);
    if (Number.isNaN(start.getTime())) return showToast('Please check weddingDateISO in config.js.');
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
    const toICS = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const escapeICS = (text) => String(text).replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
    const location = wedding.ceremonyVenue || 'Wedding ceremony';
    const content = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ever After//Wedding Invitation//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      `UID:${Date.now()}@everafter.local`, `DTSTAMP:${toICS(new Date())}`, `DTSTART:${toICS(start)}`, `DTEND:${toICS(end)}`,
      `SUMMARY:${escapeICS(`${titleNames} — Wedding Day`)}`, `LOCATION:${escapeICS(location)}`,
      `DESCRIPTION:${escapeICS(`Wedding celebration for ${titleNames}. Please check the invitation website for full details.`)}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding-invitation.ics';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    showToast('Calendar file downloaded. Open it to save the date.');
  });
  document.body.appendChild(calendarButton);
  const revealCalendar = () => calendarButton.classList.toggle('is-active', document.body.classList.contains('invitation-open'));
  openButton?.addEventListener('click', () => window.setTimeout(revealCalendar, 550));
})();
