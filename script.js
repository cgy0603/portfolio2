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
    element.classList.add("has-image");

    const project = element.closest("[data-project]");
    if (project) {
      project.dataset.thumbnailWidth = String(image.naturalWidth);
      project.dataset.thumbnailHeight = String(image.naturalHeight);

      const youtubeMedia = getYouTubeMedia(project.dataset.youtube);
      element.dataset.mediaOrientation = youtubeMedia
        ? getMediaOrientation(youtubeMedia.width, youtubeMedia.height)
        : orientation;
    } else {
      element.dataset.mediaOrientation = orientation;
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
  const currentStatus = document.querySelector(`[data-slider-current="${sliderName}"]`);
  const totalStatus = document.querySelector(`[data-slider-total="${sliderName}"]`);

  if (totalStatus) {
    totalStatus.textContent = String(track.children.length).padStart(2, "0");
  }

  function updateSliderButtons() {
    const maxScroll = track.scrollWidth - track.clientWidth;
    const card = track.firstElementChild;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    const step = card ? card.getBoundingClientRect().width + gap : 1;
    const currentIndex = Math.min(
      track.children.length,
      Math.max(1, Math.round(track.scrollLeft / step) + 1)
    );

    buttons.forEach((button) => {
      const direction = Number(button.dataset.direction);
      button.disabled = direction < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= maxScroll - 2;
    });

    if (currentStatus) {
      currentStatus.textContent = String(currentIndex).padStart(2, "0");
    }
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
const modalEmbed = projectModal.querySelector("iframe");
const modalImage = projectModal.querySelector("img");
const mediaPlaceholder = projectModal.querySelector(".media-placeholder");
const modalTitle = projectModal.querySelector("#modal-title");
const modalMeta = projectModal.querySelector(".modal-meta");
const modalDetails = projectModal.querySelector(".modal-details");
const modalGallery = projectModal.querySelector(".modal-gallery");
const modalGalleryList = projectModal.querySelector(".modal-gallery-list");
let lastFocusedElement = null;
let currentModalItem = null;

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

function getYouTubeMedia(source) {
  if (!source) {
    return null;
  }

  try {
    const url = new URL(source);

    if (url.hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] || "";
      return id ? { id, width: 16, height: 9 } : null;
    }

    if (url.hostname.endsWith("youtube.com")) {
      if (url.pathname === "/watch") {
        const id = url.searchParams.get("v") || "";
        return id ? { id, width: 16, height: 9 } : null;
      }

      const [, type, id] = url.pathname.split("/");
      if (!id || !["shorts", "embed"].includes(type)) {
        return null;
      }

      return type === "shorts" ? { id, width: 9, height: 16 } : { id, width: 16, height: 9 };
    }
  } catch {
    return null;
  }

  return null;
}

function prepareProjectMedia(project) {
  const media = getYouTubeMedia(project.dataset.youtube);
  if (!media) {
    return;
  }

  updateProjectMediaData(project, media.width, media.height);

  if (currentModalItem === project && projectModal.classList.contains("is-open")) {
    updateModalMediaLayout(media.width, media.height);
  }
}

function renderModalDetails(items) {
  modalDetails.replaceChildren();

  items
    .filter(({ value }) => value && value.trim())
    .forEach(({ term, value }) => {
      const row = document.createElement("div");
      const title = document.createElement("dt");
      const description = document.createElement("dd");

      title.textContent = term;
      description.textContent = value;
      row.append(title, description);
      modalDetails.append(row);
    });
}

function parseGalleryItems(source) {
  if (!source) {
    return [];
  }

  return source
    .split("||")
    .map((item) => {
      const [src, caption, alt] = item.split("|").map((part) => part.trim());
      return { src, caption, alt };
    })
    .filter(({ src }) => src);
}

function syncModalGalleryItems() {
  [...modalGalleryList.children].forEach((figure, index) => {
    const number = figure.querySelector(".modal-gallery-index");

    if (number) {
      number.textContent = String(index + 1).padStart(2, "0");
    }
  });

  modalGallery.hidden = modalGalleryList.children.length === 0;
}

function renderModalGallery(items, title) {
  modalGalleryList.replaceChildren();
  modalGallery.hidden = true;

  if (!items.length) {
    return;
  }

  items.forEach(({ src, caption, alt }, index) => {
    const figure = document.createElement("figure");
    const number = document.createElement("span");
    const image = document.createElement("img");

    figure.className = "modal-gallery-item is-loading";
    number.className = "modal-gallery-index";
    number.textContent = String(index + 1).padStart(2, "0");

    image.loading = "lazy";
    image.decoding = "async";
    const imageDescription = alt || caption;
    image.alt = imageDescription
      ? `${title} - ${imageDescription}`
      : `${title} 작업 이미지 ${String(index + 1).padStart(2, "0")}`;

    image.addEventListener("load", () => {
      figure.dataset.orientation = getMediaOrientation(image.naturalWidth, image.naturalHeight);
      figure.classList.remove("is-loading");
    });

    image.addEventListener("error", () => {
      figure.remove();
      syncModalGalleryItems();
    });

    figure.append(number, image);

    if (caption) {
      const description = document.createElement("figcaption");
      description.textContent = caption;
      figure.append(description);
    }

    modalGalleryList.append(figure);
    image.src = src;
  });

  syncModalGalleryItems();
}

function openDetailModal(item) {
  const {
    title,
    category,
    displayTitle,
    displayCategory,
    year,
    youtube,
    modalImage: image,
    mediaWidth,
    mediaHeight,
    description,
    role,
    contribution,
    designFocus,
    designStructure,
    designTools,
    gallery,
  } = item.dataset;
  const isDesign = item.hasAttribute("data-design");
  const modalDisplayTitle = displayTitle || title;
  const modalDisplayCategory = displayCategory || category;

  lastFocusedElement = document.activeElement;
  currentModalItem = item;
  modalDialog.dataset.modalType = isDesign ? "design" : "project";
  updateModalMediaLayout(
    Number(mediaWidth) || Number(item.dataset.thumbnailWidth) || 16,
    Number(mediaHeight) || Number(item.dataset.thumbnailHeight) || 9
  );
  modalTitle.textContent = modalDisplayTitle;
  modalMeta.textContent = `${modalDisplayCategory} \u00b7 ${year}`;
  renderModalDetails(
    isDesign
      ? [
          { term: "\uc791\uc5c5 \uac1c\uc694", value: description },
          { term: "\ub514\uc790\uc778 \ud3ec\uc778\ud2b8", value: designFocus },
          { term: "\ud398\uc774\uc9c0 \uad6c\uc131", value: designStructure },
          { term: "\uc0ac\uc6a9 \ub3c4\uad6c", value: designTools },
        ]
      : [
          { term: "\uc18c\uac1c", value: description },
          { term: "\ub2f4\ub2f9 \uc5ed\ud560", value: role },
          { term: "\uae30\uc5ec \ub0b4\uc6a9", value: contribution },
        ]
  );
  renderModalGallery(parseGalleryItems(gallery), modalDisplayTitle);

  modalEmbed.removeAttribute("src");
  modalImage.removeAttribute("src");
  modalImage.alt = "";

  if (youtube) {
    const youtubeMedia = getYouTubeMedia(youtube);

    if (youtubeMedia) {
      modalEmbed.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeMedia.id)}?rel=0`;
      modalEmbed.title = `${title} 프로젝트 영상`;
      mediaPlaceholder.hidden = true;
    } else {
      mediaPlaceholder.hidden = false;
    }
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
  modalEmbed.removeAttribute("src");
  modalImage.removeAttribute("src");
  modalImage.alt = "";
  renderModalGallery([], "");
  updateModalMediaLayout();
  delete modalDialog.dataset.modalType;
  currentModalItem = null;
  document.body.style.overflow = "";
  lastFocusedElement?.focus();
}

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

  prepareProjectMedia(project);
  openButton.addEventListener("click", () => {
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
