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
let lastFocusedElement = null;

function openProjectModal(button) {
  const { videoId, orientation, title, meta, description, role } = button.dataset;
  lastFocusedElement = button;
  dialog.dataset.orientation = orientation || "landscape";
  modalFrame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0`;
  modalFrame.title = `${title} 프로젝트 영상`;
  modalTitle.textContent = title;
  modalMeta.textContent = meta;
  modalDescription.textContent = description;
  modalRole.textContent = role;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  dialog.focus();
}

function closeProjectModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  modalFrame.removeAttribute("src");
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
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeProjectModal();
  }
});
