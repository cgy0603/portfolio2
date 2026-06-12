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

function getMediaOrientation(width, height) {
  if (!width || !height) {
    return "landscape";
  }

  const ratioDifference = Math.abs(width - height) / Math.max(width, height);
  return ratioDifference < 0.08 ? "square" : height > width ? "portrait" : "landscape";
}

function updateProjectMediaData(project, width, height) {
  if (!project || !width || !height) {
    return;
  }

  project.dataset.mediaWidth = String(width);
  project.dataset.mediaHeight = String(height);

  const thumbnail = project.querySelector(".card-image");
  if (thumbnail) {
    thumbnail.dataset.mediaOrientation = getMediaOrientation(width, height);
  }
}

document.querySelectorAll("[data-image]").forEach((element) => {
  const imagePath = element.dataset.image;
  element.style.setProperty("--image", `url("${imagePath}")`);

  const image = new Image();
  image.addEventListener("load", () => {
    const orientation = getMediaOrientation(image.naturalWidth, image.naturalHeight);

    element.dataset.imageOrientation = orientation;
    element.dataset.mediaOrientation = orientation;
    element.classList.add("has-image");

    const project = element.closest("[data-project]");
    if (project) {
      project.dataset.thumbnailWidth = String(image.naturalWidth);
      project.dataset.thumbnailHeight = String(image.naturalHeight);
    }
  });
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
const modalEmbed = projectModal.querySelector("iframe");
const modalImage = projectModal.querySelector("img");
const mediaPlaceholder = projectModal.querySelector(".media-placeholder");
const modalTitle = projectModal.querySelector("#modal-title");
const modalMeta = projectModal.querySelector(".modal-meta");
const modalDescription = projectModal.querySelector("[data-modal-description]");
const modalRole = projectModal.querySelector("[data-modal-role]");
const modalContribution = projectModal.querySelector("[data-modal-contribution]");
let lastFocusedElement = null;
let currentModalItem = null;
const videoMetadataCache = new Map();

function updateModalMediaLayout(width = 16, height = 9) {
  if (!width || !height) {
    width = 16;
    height = 9;
  }

  const orientation = getMediaOrientation(width, height);

  modalDialog.dataset.mediaOrientation = orientation;
  modalMedia.style.setProperty("--media-ratio", `${width} / ${height}`);

  if (orientation === "portrait") {
    modalDialog.style.setProperty(
      "--portrait-media-width",
      `min(430px, calc((100vh - 80px) * ${width / height}))`
    );
  } else {
    modalDialog.style.removeProperty("--portrait-media-width");
  }
}

function loadVideoMetadata(source) {
  if (!source) {
    return Promise.resolve(null);
  }

  if (videoMetadataCache.has(source)) {
    return videoMetadataCache.get(source);
  }

  const metadataPromise = new Promise((resolve) => {
    const video = document.createElement("video");

    function cleanUp() {
      video.pause();
      video.removeAttribute("src");
    }

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.addEventListener(
      "loadedmetadata",
      () => {
        const dimensions = { width: video.videoWidth, height: video.videoHeight };
        cleanUp();
        resolve(dimensions);
      },
      { once: true }
    );
    video.addEventListener(
      "error",
      () => {
        cleanUp();
        resolve(null);
      },
      { once: true }
    );
    video.src = source;
  });

  videoMetadataCache.set(source, metadataPromise);
  return metadataPromise;
}

function getYouTubeVideoId(source) {
  if (!source) {
    return "";
  }

  try {
    const url = new URL(source);

    if (url.hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (url.hostname.endsWith("youtube.com")) {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v") || "";
      }

      const [, type, id] = url.pathname.split("/");
      return ["shorts", "embed"].includes(type) ? id || "" : "";
    }
  } catch {
    return source;
  }

  return "";
}

async function prepareProjectMedia(project) {
  const dimensions = await loadVideoMetadata(project.dataset.video);

  if (!dimensions) {
    return;
  }

  updateProjectMediaData(project, dimensions.width, dimensions.height);

  if (currentModalItem === project && projectModal.classList.contains("is-open")) {
    updateModalMediaLayout(dimensions.width, dimensions.height);
  }
}

function openDetailModal(item) {
  const {
    title,
    category,
    year,
    video,
    youtube,
    modalImage: image,
    mediaWidth,
    mediaHeight,
    description,
    role,
    contribution,
  } = item.dataset;

  lastFocusedElement = document.activeElement;
  currentModalItem = item;
  updateModalMediaLayout(
    Number(mediaWidth) || Number(item.dataset.thumbnailWidth) || 16,
    Number(mediaHeight) || Number(item.dataset.thumbnailHeight) || 9
  );
  modalTitle.textContent = title;
  modalMeta.textContent = `${category} · ${year}`;
  modalDescription.textContent = description;
  modalRole.textContent = role;
  modalContribution.textContent = contribution;

  modalVideo.removeAttribute("src");
  modalEmbed.removeAttribute("src");
  modalImage.removeAttribute("src");
  modalImage.alt = "";

  if (youtube) {
    const youtubeId = getYouTubeVideoId(youtube);

    if (youtubeId) {
      modalEmbed.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?rel=0`;
      modalEmbed.title = `${title} 프로젝트 영상`;
      mediaPlaceholder.hidden = true;
    } else {
      mediaPlaceholder.hidden = false;
    }
  } else if (video) {
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
  modalEmbed.removeAttribute("src");
  modalImage.removeAttribute("src");
  modalImage.alt = "";
  updateModalMediaLayout();
  currentModalItem = null;
  document.body.style.overflow = "";
  lastFocusedElement?.focus();
}

modalVideo.addEventListener("loadedmetadata", () => {
  updateProjectMediaData(currentModalItem, modalVideo.videoWidth, modalVideo.videoHeight);
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
  const openButton = project.querySelector(".project-open");

  project.addEventListener("pointerenter", () => prepareProjectMedia(project), { once: true });
  openButton.addEventListener("focus", () => prepareProjectMedia(project), { once: true });
  openButton.addEventListener("click", () => {
    prepareProjectMedia(project);
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
