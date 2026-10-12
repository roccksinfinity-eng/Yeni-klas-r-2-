const toggle = document.querySelector(".menu-toggle");
const panel = document.querySelector(".menu-panel");

if (toggle && panel) {
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menyunu bağla" : "Menyunu aç");
    panel.classList.toggle("open", open);
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  panel.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

if (!document.querySelector(".floating-actions")) {
  const floatingActions = document.createElement("div");
  floatingActions.className = "floating-actions";
  floatingActions.setAttribute("aria-label", "Sürətli əlaqə");
  floatingActions.innerHTML = `
    <a class="float-button whatsapp" href="https://wa.me/994993028828" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ilə yazın"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.7A8.5 8.5 0 1 1 20.5 11.5Z" /><path d="M8.3 8.1c.3-.6.6-.6.9-.6h.4c.2 0 .4 0 .5.4l.7 1.7c.1.3 0 .5-.1.7l-.5.6c-.2.2-.2.4 0 .6.5.8 1.2 1.5 2 1.9.3.2.5.2.7-.1l.7-.8c.2-.2.4-.3.7-.2l1.6.8c.3.1.4.3.4.5 0 .3-.2 1.1-.7 1.5-.5.5-1.2.7-1.9.6-1-.1-2.2-.6-3.5-1.7-1.5-1.3-2.5-2.9-2.8-3.9-.3-1 .1-1.8.5-2Z" /></svg></a>
    <a class="float-button call" href="tel:+994993028828" aria-label="Zəng edin"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 11.2 19a19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.8a2 2 0 0 1-.6 1.7L7.1 10a16 16 0 0 0 6 6l1.8-1.9a2 2 0 0 1 1.7-.6l2.8.5a2 2 0 0 1 1.6 1.9Z" /></svg></a>`;
  document.body.append(floatingActions);

  const backToTopButton = document.createElement("button");
  backToTopButton.className = "back-to-top";
  backToTopButton.type = "button";
  backToTopButton.setAttribute("aria-label", "Yuxarı qayıt");
  backToTopButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>';
  document.body.append(backToTopButton);

  const updateBackToTopVisibility = () => {
    backToTopButton.classList.toggle("visible", window.scrollY > 480);
  };

  window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
  updateBackToTopVisibility();
  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const subject = document.querySelector("#subject");
const topic = new URLSearchParams(window.location.search).get("topic");
if (subject && topic) subject.value = topic;

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (window.location.protocol === "file:") {
      const formData = new FormData(contactForm);
      const subjectLine = String(formData.get("_subject") || "Rovex saytından müraciət");
      const message = [
        `Ad: ${formData.get("name")}`,
        `E-poçt: ${formData.get("email")}`,
        `Mövzu: ${subjectLine}`,
        "",
        String(formData.get("message") || "")
      ].join("\n");
      formStatus.textContent = "E-poçt proqramınızda müraciət layihəsi açılır. Göndərmək üçün e-poçt proqramında təsdiqləyin.";
      window.location.href = `mailto:rovex20492@gmail.com?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(message)}`;
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (!(submitButton instanceof HTMLButtonElement)) {
      throw new Error("Əlaqə formasında göndər düyməsi tapılmadı.");
    }

    formStatus.classList.remove("success", "error");
    formStatus.textContent = "Müraciət göndərilir...";
    submitButton.disabled = true;

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm).entries()))
      });
      const result = await response.json();

      if (!response.ok || (result.success !== true && result.success !== "true")) {
        throw new Error(result.message || "Müraciəti göndərmək mümkün olmadı.");
      }

      formStatus.textContent = "Müraciətiniz uğurla göndərildi. Təşəkkür edirik!";
      formStatus.classList.add("success");
      contactForm.reset();
    } catch (error) {
      console.error("Əlaqə formu göndərilmədi:", error);
      formStatus.textContent = error instanceof Error
        ? `${error.message} Zəhmət olmasa bir az sonra yenidən cəhd edin.`
        : "Müraciəti göndərmək mümkün olmadı. Zəhmət olmasa bir az sonra yenidən cəhd edin.";
      formStatus.classList.add("error");
    } finally {
      submitButton.disabled = false;
    }
  });
}

const revealItems = document.querySelectorAll(".page-intro, .service-card, .article-card, .contact-card, .contact-detail, .about-layout, .faq-item, .faq-cta, .login-card");
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.visibilityState === "hidden" || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => {
    item.classList.add("reveal");
    revealObserver.observe(item);
  });
}
