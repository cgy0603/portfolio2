const mainContent = document.querySelector("main");
const projectsSection = document.querySelector("#project");
const aboutSection = document.querySelector("#about");

// Place the strongest evidence of ability directly after the introduction.
mainContent.insertBefore(projectsSection, aboutSection);

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

document.querySelectorAll("[data-track]").forEach((track) => {
  const sliderName = track.dataset.track;
  const buttons = [...document.querySelectorAll(`[data-slider="${sliderName}"]`)];

  function updateSliderButtons() {
    const maxScroll = track.scrollWidth - track.clientWidth;

    buttons.forEach((button) => {
      const direction = Number(button.dataset.direction);
      button.disabled = direction < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= maxScroll - 2;
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = Number(button.dataset.direction);
      const card = track.firstElementChild;
      const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;

      track.scrollBy({
        left: direction * (card.getBoundingClientRect().width + gap),
        behavior: "smooth",
      });
    });
  });

  track.addEventListener("scroll", updateSliderButtons, { passive: true });
  window.addEventListener("resize", updateSliderButtons);
  updateSliderButtons();
});

const projectModal = document.querySelector(".project-modal");
const modalDialog = projectModal.querySelector(".modal-dialog");
const modalMedia = projectModal.querySelector(".modal-media");
const modalVideo = projectModal.querySelector("video");
const modalImage = projectModal.querySelector("img");
const mediaPlaceholder = projectModal.querySelector(".media-placeholder");
const modalTitle = projectModal.querySelector("#modal-title");
const modalMeta = projectModal.querySelector(".modal-meta");
const modalDescription = projectModal.querySelector("[data-modal-description]");
const modalRole = projectModal.querySelector("[data-modal-role]");
const modalContribution = projectModal.querySelector("[data-modal-contribution]");
let lastFocusedElement = null;

function updateModalMediaLayout(width = 16, height = 9) {
  if (!width || !height) {
    width = 16;
    height = 9;
  }

  const ratioDifference = Math.abs(width - height) / Math.max(width, height);
  const orientation = ratioDifference < 0.08 ? "square" : height > width ? "portrait" : "landscape";

  modalDialog.dataset.mediaOrientation = orientation;
  modalMedia.style.setProperty("--media-ratio", `${width} / ${height}`);
}

function openDetailModal(item) {
  const { title, category, year, video, modalImage: image, description, role, contribution } = item.dataset;

  lastFocusedElement = document.activeElement;
  updateModalMediaLayout();
  modalTitle.textContent = title;
  modalMeta.textContent = `${category} · ${year}`;
  modalDescription.textContent = description;
  modalRole.textContent = role;
  modalContribution.textContent = contribution;

  modalVideo.removeAttribute("src");
  modalImage.removeAttribute("src");
  modalImage.alt = "";

  if (video) {
    modalVideo.src = video;
    mediaPlaceholder.hidden = true;
  } else if (image) {
    modalImage.src = image;
    modalImage.alt = `${title} 상세 이미지`;
    mediaPlaceholder.hidden = true;
  } else {
    mediaPlaceholder.hidden = false;
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
  modalImage.removeAttribute("src");
  modalImage.alt = "";
  updateModalMediaLayout();
  document.body.style.overflow = "";
  lastFocusedElement?.focus();
}

modalVideo.addEventListener("loadedmetadata", () => {
  updateModalMediaLayout(modalVideo.videoWidth, modalVideo.videoHeight);
});

modalVideo.addEventListener("error", () => {
  modalVideo.removeAttribute("src");
  mediaPlaceholder.hidden = false;
});

modalImage.addEventListener("load", () => {
  updateModalMediaLayout(modalImage.naturalWidth, modalImage.naturalHeight);
});

modalImage.addEventListener("error", () => {
  modalImage.removeAttribute("src");
  modalImage.alt = "";
  mediaPlaceholder.hidden = false;
});

document.querySelectorAll("[data-project]").forEach((project) => {
  project.querySelector(".project-open").addEventListener("click", () => {
    openDetailModal(project);
  });
});

document.querySelectorAll("[data-design]").forEach((design) => {
  design.querySelector(".design-open").addEventListener("click", () => {
    openDetailModal(design);
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
