(() => {
  const nav = document.querySelector(".site-nav");
  const menuButton = document.querySelector(".menu-toggle");
  const navLinks = [...document.querySelectorAll(".site-nav a")];

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }

  if ("IntersectionObserver" in window) {
    const sections = [...document.querySelectorAll(".section-anchor")];
    const byId = new Map(navLinks.map((link) => [link.getAttribute("href"), link]));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        navLinks.forEach((link) => link.classList.remove("is-active"));
        const link = byId.get(`#${visible.target.id}`);
        if (link) link.classList.add("is-active");
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.15, 0.35, 0.6] }
    );

    sections.forEach((section) => observer.observe(section));
  }

  const printButton = document.querySelector("[data-print]");
  if (printButton) {
    printButton.addEventListener("click", () => window.print());
  }

  const scrollToHash = () => {
    const rawId = window.location.hash.slice(1);
    let id = rawId;
    try {
      id = typeof window.decodeURIComponent === "function" ? window.decodeURIComponent(rawId) : rawId;
    } catch {
      id = rawId;
    }
    if (!id) return;

    const target = document.getElementById(id);
    if (target) {
      const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - margin);
      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo({ top, behavior: "auto" });
      root.style.scrollBehavior = previousScrollBehavior;
    }
  };

  window.addEventListener("load", () => {
    requestAnimationFrame(scrollToHash);
    window.setTimeout(scrollToHash, 150);
    window.setTimeout(scrollToHash, 700);
    window.setTimeout(scrollToHash, 1300);
  });
  window.addEventListener("hashchange", () => {
    requestAnimationFrame(scrollToHash);
  });

  const emailButton = document.querySelector("[data-email-button]");
  const emailOutput = document.querySelector("[data-email-output]");

  if (emailButton && emailOutput) {
    emailButton.addEventListener("click", async () => {
      const parts = ["22112369", "yu.ac.kr"];
      const email = `${parts[0]}@${parts[1]}`;
      emailOutput.hidden = false;
      emailOutput.textContent = email;
      emailButton.textContent = "이메일 표시됨";

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
          emailButton.textContent = "이메일 복사됨";
        }
      } catch {
        emailButton.textContent = "이메일 표시됨";
      }
    });
  }
})();
