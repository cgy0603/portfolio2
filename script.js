const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 20);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("open", !isOpen);
  document.body.style.overflow = isOpen ? "" : "hidden";
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    navigation.classList.remove("open");
    document.body.style.overflow = "";
  });
});

document.querySelectorAll("[data-image]").forEach((element) => {
  const imagePath = element.dataset.image;
  element.style.setProperty("--image", `url("${imagePath}")`);

  const image = new Image();
  image.addEventListener("load", () => element.classList.add("has-image"));
  image.src = imagePath;
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

document.querySelectorAll("[data-slider]").forEach((button) => {
  button.addEventListener("click", () => {
    const track = document.querySelector(`[data-track="${button.dataset.slider}"]`);
    const direction = Number(button.dataset.direction);
    const card = track.firstElementChild;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;

    track.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: "smooth",
    });
  });
});

const projectModal = document.querySelector(".project-modal");
const modalDialog = projectModal.querySelector(".modal-dialog");
const modalVideo = projectModal.querySelector("video");
const videoPlaceholder = projectModal.querySelector(".video-placeholder");
const modalTitle = projectModal.querySelector("#modal-title");
const modalMeta = projectModal.querySelector(".modal-meta");
const modalDescription = projectModal.querySelector("[data-modal-description]");
const modalRole = projectModal.querySelector("[data-modal-role]");
const modalContribution = projectModal.querySelector("[data-modal-contribution]");
let lastFocusedElement = null;

function openProjectModal(project) {
  const { title, category, year, video, description, role, contribution } = project.dataset;

  lastFocusedElement = document.activeElement;
  modalTitle.textContent = title;
  modalMeta.textContent = `${category} · ${year}`;
  modalDescription.textContent = description;
  modalRole.textContent = role;
  modalContribution.textContent = contribution;

  if (video) {
    modalVideo.src = video;
    videoPlaceholder.hidden = true;
  } else {
    modalVideo.removeAttribute("src");
    videoPlaceholder.hidden = false;
  }

  projectModal.classList.add("is-open");
  projectModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modalDialog.focus();
}

function closeProjectModal() {
  projectModal.classList.remove("is-open");
  projectModal.setAttribute("aria-hidden", "true");
  modalVideo.pause();
  modalVideo.removeAttribute("src");
  modalVideo.load();
  document.body.style.overflow = "";
  lastFocusedElement?.focus();
}

modalVideo.addEventListener("error", () => {
  modalVideo.removeAttribute("src");
  videoPlaceholder.hidden = false;
});

document.querySelectorAll("[data-project]").forEach((project) => {
  project.querySelector(".project-open").addEventListener("click", () => {
    openProjectModal(project);
  });
});

projectModal.querySelectorAll("[data-modal-close]").forEach((button) => {
  button.addEventListener("click", closeProjectModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && projectModal.classList.contains("is-open")) {
    closeProjectModal();
  }
});
