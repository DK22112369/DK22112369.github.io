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

  const copyEmailButton = document.querySelector("[data-copy-email]");
  if (copyEmailButton) {
    const originalText = copyEmailButton.textContent;
    copyEmailButton.addEventListener("click", async () => {
      const email = copyEmailButton.dataset.email || "";
      if (!email) return;

      try {
        await navigator.clipboard.writeText(email);
        copyEmailButton.textContent = "복사됨";
      } catch {
        copyEmailButton.textContent = email;
      }

      window.setTimeout(() => {
        copyEmailButton.textContent = originalText;
      }, 1800);
    });
  }

  const paperModal = document.querySelector("[data-paper-modal]");
  const paperTriggers = [...document.querySelectorAll("[data-paper-title]")];
  const paperViewerModal = document.querySelector("[data-paper-viewer-modal]");

  if (paperModal && paperTriggers.length > 0) {
    const modalTitle = paperModal.querySelector("[data-paper-modal-title]");
    const modalEnglish = paperModal.querySelector("[data-paper-modal-english]");
    const modalSummary = paperModal.querySelector("[data-paper-modal-summary]");
    const modalConference = paperModal.querySelector("[data-paper-conference]");
    const modalLink = paperModal.querySelector("[data-paper-modal-link]");
    const viewButton = paperModal.querySelector("[data-paper-view]");
    const closeButton = paperModal.querySelector("[data-paper-close]");
    const viewerTitle = paperViewerModal?.querySelector("[data-paper-viewer-title]");
    const viewerFrame = paperViewerModal?.querySelector("[data-paper-frame]");
    const viewerCloseButton = paperViewerModal?.querySelector("[data-paper-viewer-close]");
    let lastFocused = null;
    let selectedPaperPdf = "";
    let selectedPaperTitle = "";

    const closeModal = () => {
      paperModal.hidden = true;
      document.body.classList.remove("modal-open");
      if (lastFocused) lastFocused.focus();
    };

    const closeViewerModal = () => {
      if (!paperViewerModal) return;
      paperViewerModal.hidden = true;
      if (viewerFrame) viewerFrame.removeAttribute("src");
      if (!paperModal.hidden) {
        document.body.classList.add("modal-open");
        if (viewButton && !viewButton.hidden) viewButton.focus();
        return;
      }
      document.body.classList.remove("modal-open");
    };

    const openViewerModal = () => {
      if (!paperViewerModal || !viewerFrame || !selectedPaperPdf) return;
      const pdfUrl = `${selectedPaperPdf}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
      if (viewerTitle) viewerTitle.textContent = selectedPaperTitle || "논문 보기";
      viewerFrame.src = pdfUrl;
      paperViewerModal.hidden = false;
      document.body.classList.add("modal-open");
      if (viewerCloseButton) viewerCloseButton.focus();
    };

    const openModal = (trigger) => {
      const conference = trigger.dataset.paperConference || "학회";
      lastFocused = trigger;
      selectedPaperPdf = trigger.dataset.paperPdf || "";
      selectedPaperTitle = trigger.dataset.paperTitle || "";

      modalTitle.textContent = trigger.dataset.paperTitle || "";
      modalEnglish.textContent = trigger.dataset.paperEnglish || "";
      modalSummary.textContent = trigger.dataset.paperSummary || "";
      modalConference.textContent = conference;
      modalLink.href = trigger.dataset.paperLink || "#";
      modalLink.textContent = `${conference} 학회 링크 열기`;
      if (viewButton) {
        viewButton.hidden = !selectedPaperPdf;
      }

      paperModal.hidden = false;
      document.body.classList.add("modal-open");
      closeButton.focus();
    };

    paperTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => openModal(trigger));
    });

    closeButton.addEventListener("click", closeModal);
    if (viewButton) {
      viewButton.addEventListener("click", openViewerModal);
    }
    if (viewerCloseButton) {
      viewerCloseButton.addEventListener("click", closeViewerModal);
    }

    paperModal.addEventListener("click", (event) => {
      if (event.target === paperModal) closeModal();
    });
    if (paperViewerModal) {
      paperViewerModal.addEventListener("click", (event) => {
        if (event.target === paperViewerModal) closeViewerModal();
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (paperViewerModal && !paperViewerModal.hidden) {
        closeViewerModal();
        return;
      }
      if (!paperModal.hidden) closeModal();
    });
  }

  const platformModal = document.querySelector("[data-platform-modal]");
  const platformTriggers = [...document.querySelectorAll("[data-platform-title]")];

  if (platformModal && platformTriggers.length > 0) {
    const modalTitle = platformModal.querySelector("[data-platform-modal-title]");
    const modalDetail = platformModal.querySelector("[data-platform-modal-detail]");
    const modalSummary = platformModal.querySelector("[data-platform-modal-summary]");
    const modalKind = platformModal.querySelector("[data-platform-modal-kind]");
    const modalLink = platformModal.querySelector("[data-platform-modal-link]");
    const closeButton = platformModal.querySelector("[data-platform-close]");
    let lastFocused = null;

    const closeModal = () => {
      platformModal.hidden = true;
      document.body.classList.remove("modal-open");
      if (lastFocused) lastFocused.focus();
    };

    const openModal = (trigger) => {
      lastFocused = trigger;

      modalTitle.textContent = trigger.dataset.platformTitle || "";
      modalDetail.textContent = trigger.dataset.platformDetail || "";
      modalSummary.textContent = trigger.dataset.platformSummary || "";
      modalKind.textContent = trigger.dataset.platformKind || "Platform";
      modalLink.href = trigger.dataset.platformLink || "#";
      modalLink.textContent = `${trigger.dataset.platformTitle || "플랫폼"} 사진·자료 링크 열기`;

      platformModal.hidden = false;
      document.body.classList.add("modal-open");
      closeButton.focus();
    };

    platformTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => openModal(trigger));
    });

    closeButton.addEventListener("click", closeModal);

    platformModal.addEventListener("click", (event) => {
      if (event.target === platformModal) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !platformModal.hidden) closeModal();
    });
  }
})();
