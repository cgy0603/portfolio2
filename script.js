const header = document.querySelector(".site-header");
const menu = document.querySelector(".menu");
const nav = document.querySelector("nav");

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 24);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") === "true";
  menu.setAttribute("aria-expanded", String(!open));
  menu.setAttribute("aria-label", open ? "메뉴 열기" : "메뉴 닫기");
  nav.classList.toggle("open", !open);
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "메뉴 열기");
    nav.classList.remove("open");
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const modal = document.querySelector(".project-modal");
const dialog = modal.querySelector(".modal-dialog");
const modalFrame = modal.querySelector("iframe");
const modalTitle = modal.querySelector("#modal-title");
const modalMeta = modal.querySelector(".modal-meta");
const modalDescription = modal.querySelector(".modal-description");
const modalRole = modal.querySelector(".modal-role p");
const modalDetails = modal.querySelectorAll(".modal-details");
const modalDetailVideos = modal.querySelectorAll(".modal-detail-video");
const pageRegions = [
  document.querySelector(".site-header"),
  document.querySelector("main"),
  document.querySelector("footer"),
].filter(Boolean);
let lastFocusedElement = null;

function getModalFocusableElements() {
  return [...dialog.querySelectorAll(
    'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
  )].filter((element) => {
    const hiddenPanel = element.closest("[hidden]");
    return !hiddenPanel && element.getClientRects().length > 0;
  });
}

modal.querySelectorAll(".modal-comparison").forEach((comparison) => {
  const videos = [...comparison.querySelectorAll("video")];
  videos.forEach((video) => {
    video.addEventListener("ended", () => {
      if (!modal.classList.contains("open")) return;
      videos.forEach((item) => {
        item.currentTime = 0;
        item.play().catch(() => {});
      });
    });
  });
});

function openProjectModal(button) {
  const { videoId, orientation, title, meta, description, role, details } = button.dataset;
  lastFocusedElement = button;
  dialog.dataset.orientation = orientation || "landscape";
  dialog.classList.toggle("has-details", Boolean(details));
  modalFrame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&playsinline=1&hl=ko`;
  modalFrame.title = `${title} 프로젝트 영상`;
  modalTitle.textContent = title;
  modalMeta.textContent = meta;
  modalDescription.textContent = description;
  modalDescription.hidden = !description;
  modalRole.textContent = role;
  modalDetails.forEach((panel) => {
    panel.hidden = panel.dataset.projectDetails !== details;
  });
  modalDetailVideos.forEach((video) => {
    const panel = video.closest(".modal-details");
    if (panel && !panel.hidden) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  pageRegions.forEach((region) => {
    region.inert = true;
  });
  document.body.style.overflow = "hidden";
  dialog.scrollTop = 0;
  modalTitle.focus({ preventScroll: true });
}

function closeProjectModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  pageRegions.forEach((region) => {
    region.inert = false;
  });
  modalFrame.removeAttribute("src");
  modalDetailVideos.forEach((video) => {
    video.pause();
    video.currentTime = 0;
  });
  document.body.style.overflow = "";
  lastFocusedElement?.focus();
}

document.querySelectorAll(".project-open").forEach((button) => {
  button.addEventListener("click", () => openProjectModal(button));
});

modal.querySelectorAll("[data-modal-close]").forEach((element) => {
  element.addEventListener("click", closeProjectModal);
});

document.addEventListener("keydown", (event) => {
  if (!modal.classList.contains("open")) return;

  if (event.key === "Escape") {
    closeProjectModal();
    return;
  }

  if (event.key === "Tab") {
    const focusableElements = getModalFocusableElements();
    if (!focusableElements.length) {
      event.preventDefault();
      modalTitle.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (document.activeElement === modalTitle) {
      event.preventDefault();
      (event.shiftKey ? lastElement : firstElement).focus();
    } else if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    } else if (!dialog.contains(document.activeElement)) {
      event.preventDefault();
      firstElement.focus();
    }
  }
});
