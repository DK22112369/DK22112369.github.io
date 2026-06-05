(() => {
  const accessGate = document.querySelector("[data-access-gate]");
  const accessForm = document.querySelector("[data-access-form]");
  const accessInput = document.querySelector("[data-access-input]");
  const accessError = document.querySelector("[data-access-error]");
  const accessStorageKey = "dk-portfolio-access-v2";
  const accessHash = "9a811f1e6602592dfe11659a453f338c66ef2ced8bd372c296681c756486e0ef";

  const toHex = (buffer) => {
    return [...new Uint8Array(buffer)].map((value) => value.toString(16).padStart(2, "0")).join("");
  };

  const digestAccessCode = async (value) => {
    const encoded = new TextEncoder().encode(value.trim());
    return toHex(await crypto.subtle.digest("SHA-256", encoded));
  };

  const unlockAccess = () => {
    document.body.classList.remove("access-locked");
    if (accessGate) accessGate.hidden = true;
  };

  const initAccessGate = async () => {
    if (!accessGate || !accessForm || !accessInput) return;

    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get("access") || "";
    const stored = window.sessionStorage.getItem(accessStorageKey) || window.localStorage.getItem(accessStorageKey);

    if (stored === accessHash || (urlCode && (await digestAccessCode(urlCode)) === accessHash)) {
      window.sessionStorage.setItem(accessStorageKey, accessHash);
      window.localStorage.setItem(accessStorageKey, accessHash);
      if (urlCode) {
        params.delete("access");
        const query = params.toString();
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
        window.history.replaceState({}, "", nextUrl);
      }
      unlockAccess();
      return;
    }

    accessInput.focus();
  };

  if (accessForm) {
    accessForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const ok = (await digestAccessCode(accessInput.value)) === accessHash;
      if (!ok) {
        if (accessError) accessError.hidden = false;
        accessInput.select();
        return;
      }
      window.sessionStorage.setItem(accessStorageKey, accessHash);
      window.localStorage.setItem(accessStorageKey, accessHash);
      unlockAccess();
    });
  }

  initAccessGate();

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
    const viewerNote = paperViewerModal?.querySelector("[data-paper-viewer-note]");
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
      if (viewerNote) viewerNote.textContent = "자세한 내용은 학회 홈페이지에서 확인 가능합니다.";
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

  const certificateTriggers = [...document.querySelectorAll("[data-certificate-pdf]")];
  if (paperViewerModal && certificateTriggers.length > 0) {
    const viewerTitle = paperViewerModal.querySelector("[data-paper-viewer-title]");
    const viewerFrame = paperViewerModal.querySelector("[data-paper-frame]");
    const viewerNote = paperViewerModal.querySelector("[data-paper-viewer-note]");
    const viewerCloseButton = paperViewerModal.querySelector("[data-paper-viewer-close]");
    let certificateLastFocused = null;
    let certificateViewerOpen = false;

    const closeCertificateViewer = () => {
      if (!certificateViewerOpen) return;
      paperViewerModal.hidden = true;
      if (viewerFrame) viewerFrame.removeAttribute("src");
      document.body.classList.remove("modal-open");
      certificateViewerOpen = false;
      if (certificateLastFocused) certificateLastFocused.focus();
    };

    certificateTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        if (!viewerFrame) return;
        certificateLastFocused = trigger;
        const title = trigger.dataset.certificateTitle || "이수증 보기";
        const pdf = trigger.dataset.certificatePdf || "";
        if (!pdf) return;
        if (viewerTitle) viewerTitle.textContent = title;
        if (viewerNote) viewerNote.textContent = "이수증은 화면 열람용으로 표시됩니다.";
        viewerFrame.src = `${pdf}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
        certificateViewerOpen = true;
        paperViewerModal.hidden = false;
        document.body.classList.add("modal-open");
        if (viewerCloseButton) viewerCloseButton.focus();
      });
    });

    if (viewerCloseButton) {
      viewerCloseButton.addEventListener("click", closeCertificateViewer);
    }
    paperViewerModal.addEventListener("click", (event) => {
      if (event.target === paperViewerModal) closeCertificateViewer();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !paperViewerModal.hidden) closeCertificateViewer();
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
    const modalVisual = platformModal.querySelector("[data-platform-modal-visual]");
    const modalImage = platformModal.querySelector("[data-platform-modal-image]");
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
      modalLink.textContent = `${trigger.dataset.platformTitle || "플랫폼"} 자료 링크 열기`;
      if (modalVisual) {
        modalVisual.dataset.visual = trigger.dataset.platformVisual || "platform";
        modalVisual.setAttribute("aria-label", `${trigger.dataset.platformTitle || "플랫폼"} 이미지`);
        modalVisual.classList.toggle("has-image", Boolean(trigger.dataset.platformImage));
      }
      if (modalImage) {
        modalImage.src = trigger.dataset.platformImage || "";
        modalImage.alt = trigger.dataset.platformTitle ? `${trigger.dataset.platformTitle} 실제 이미지` : "";
      }

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

  const recommendModal = document.querySelector("[data-recommend-modal]");
  const recommendTriggers = [...document.querySelectorAll("[data-recommend-title]")];

  if (recommendModal && recommendTriggers.length > 0) {
    const modalTitle = recommendModal.querySelector("[data-recommend-modal-title]");
    const modalViewer = recommendModal.querySelector("[data-recommend-viewer]");
    const modalImage = recommendModal.querySelector("[data-recommend-modal-image]");
    const closeButton = recommendModal.querySelector("[data-recommend-close]");
    let lastFocused = null;

    const closeModal = () => {
      recommendModal.hidden = true;
      if (modalImage) modalImage.removeAttribute("src");
      document.body.classList.remove("modal-open");
      if (lastFocused) lastFocused.focus();
    };

    const openModal = (trigger) => {
      lastFocused = trigger;
      const image = trigger.dataset.recommendImage || "";
      modalTitle.textContent = trigger.dataset.recommendTitle || "";
      if (modalViewer) modalViewer.hidden = !image;
      if (modalImage) {
        modalImage.src = image;
        modalImage.alt = trigger.dataset.recommendTitle ? `${trigger.dataset.recommendTitle} 이미지` : "";
      }
      recommendModal.hidden = false;
      document.body.classList.add("modal-open");
      closeButton.focus();
    };

    recommendTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => openModal(trigger));
    });

    closeButton.addEventListener("click", closeModal);
    recommendModal.addEventListener("click", (event) => {
      if (event.target === recommendModal) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !recommendModal.hidden) closeModal();
    });
  }
})();
