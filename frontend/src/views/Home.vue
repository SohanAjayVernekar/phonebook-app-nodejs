<template>
  <main
    ref="pageRef"
    class="cinematic"
  >
    <div
      class="cine-bg"
      aria-hidden="true"
    >
      <div
        class="cine-blob b1"
        data-depth="0.5"
      ></div>

      <div
        class="cine-blob b2"
        data-depth="0.3"
      ></div>

      <div
        class="cine-blob b3"
        data-depth="0.7"
      ></div>

      <div class="cine-grid"></div>

      <span class="cine-particle q1"></span>
      <span class="cine-particle q2"></span>
      <span class="cine-particle q3"></span>
      <span class="cine-particle q4"></span>
      <span class="cine-particle q5"></span>
      <span class="cine-particle q6"></span>
      <span class="cine-particle q7"></span>
      <span class="cine-particle q8"></span>
    </div>

    <div class="cine-content">
      <header class="cine-nav">
        <div class="cine-brand">
          <span class="cine-logo">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <ellipse
                cx="12"
                cy="12"
                rx="9.2"
                ry="4.3"
                transform="rotate(-25 12 12)"
              />
              <circle
                cx="12"
                cy="12"
                r="3.4"
                fill="currentColor"
                stroke="none"
              />
              <circle
                cx="14.6"
                cy="6.7"
                r="1.7"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </span>

          <strong>Phonebook App</strong>
        </div>

        <nav
          class="cine-links"
          aria-label="Product"
        >
          <router-link to="/login">
            Sign In
          </router-link>

          <router-link
            to="/register"
            class="cine-nav-cta"
          >
            Get Started
          </router-link>
        </nav>
      </header>


      <section class="cine-hero">
        <p class="cine-eyebrow">
          YOUR CONNECTIONS · ORGANIZED · CONNECTED · EFFORTLESS
        </p>

        <h1>
          YOUR CONNECTIONS.
          <br />
          ONE BEAUTIFUL
          <br />
          <span>WORKSPACE.</span>
        </h1>

        <p class="cine-sub">
          Everything you need to organize
          the people who matter.
        </p>

        <div class="cine-cta">
          <router-link
            to="/register"
            class="cine-btn-primary"
          >
            <span>START EXPLORING</span>

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path :d="ICONS.arrowRight" />
            </svg>
          </router-link>

          <router-link
            to="/login"
            class="cine-btn-ghost"
          >
            SIGN IN
          </router-link>
        </div>

        <div class="cine-preview-stage">
          <div
            ref="previewRef"
            class="cine-preview"
          >
            <div class="cine-window-bar">
              <span class="cine-dots">
                <i></i><i></i><i></i>
              </span>

              <span class="cine-url">
                connect — contacts
              </span>

              <span class="cine-live">
                <i></i> Live workspace
              </span>
            </div>

            <div class="cine-window-body">
              <div class="cine-rail">
                <span class="cine-rail-logo"></span>
                <i class="on"></i><i></i><i></i><i></i><i></i>
              </div>

              <div class="cine-main">
                <div class="cine-main-head">
                  <span class="cine-main-title">
                    <strong>Contacts</strong>
                    <span>1,000 people in your network</span>
                  </span>

                  <span class="cine-main-add">+ Add</span>
                </div>

                <div
                  v-for="(row, index) in previewRows"
                  :key="row.name"
                  class="cine-row"
                  :style="{ animationDelay: `${index * 0.9}s` }"
                >
                  <span
                    class="cine-row-avatar"
                    :class="'tone-' + ((index % 3) + 1)"
                  >
                    {{ row.initials }}
                  </span>

                  <span class="cine-row-text">
                    <strong>{{ row.name }}</strong>
                    <span>{{ row.phone }}</span>
                  </span>

                  <span
                    class="cine-row-chip"
                    :class="'is-' + row.tone"
                  >
                    {{ row.tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section class="cine-section reveal">
        <p class="cine-section-label">
          EVERYTHING IN ONE PLACE
        </p>

        <h2>
          One workspace for every relationship.
        </h2>

        <div class="cine-features">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="cine-feature"
          >
            <span class="cine-feature-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path :d="ICONS[feature.icon]" />
              </svg>
            </span>

            <strong>{{ feature.title }}</strong>

            <p>{{ feature.text }}</p>
          </div>
        </div>
      </section>


      <section class="cine-section reveal">
        <div class="cine-split">
          <div>
            <p class="cine-section-label">
              CONTACT MANAGEMENT
            </p>

            <h2>
              Every contact,
              beautifully presented.
            </h2>

            <p class="cine-copy">
              Large profiles, instant search, thoughtful
              categories, and favorites — composed into
              one calm, spacious workspace.
            </p>

            <router-link
              to="/register"
              class="cine-text-cta"
            >
              Start organizing
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path :d="ICONS.arrowRight" />
              </svg>
            </router-link>
          </div>

          <div
            class="cine-profile-mock"
            aria-hidden="true"
          >
            <span class="cine-profile-avatar">SW</span>

            <strong>Sarah Williams</strong>

            <span class="cine-profile-role">Work · Product Designer</span>

            <span class="cine-profile-rows">
              <i></i><i></i><i></i>
            </span>
          </div>
        </div>
      </section>


      <section class="cine-section reveal">
        <p class="cine-section-label">
          NETWORK INSIGHT
        </p>

        <h2>
          See your network clearly.
        </h2>

        <div
          class="cine-bars"
          aria-hidden="true"
        >
          <span style="--h: 38%"></span>
          <span style="--h: 62%"></span>
          <span style="--h: 45%"></span>
          <span style="--h: 80%"></span>
          <span style="--h: 58%"></span>
          <span style="--h: 92%"></span>
          <span style="--h: 70%"></span>
        </div>
      </section>


      <section class="cine-final reveal">
        <h2>
          Bring your people
          together.
        </h2>

        <p>
          Create your free workspace in seconds.
        </p>

        <div class="cine-cta center">
          <router-link
            to="/register"
            class="cine-btn-primary"
          >
            <span>START EXPLORING</span>

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path :d="ICONS.arrowRight" />
            </svg>
          </router-link>

          <router-link
            to="/login"
            class="cine-btn-ghost"
          >
            SIGN IN
          </router-link>
        </div>
      </section>


      <footer class="cine-footer">
        <span>Phonebook App</span>
      </footer>
    </div>
  </main>
</template>


<script setup>
import {
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";

import { ICONS } from "../icons";


/* Presentational preview rows (landing mock only —
   the application itself always uses real API data). */
const previewRows = [
  {
    initials: "SW",
    name: "Sarah Williams",
    phone: "+91 98765 43210",
    tag: "WORK",
    tone: "work",
  },
  {
    initials: "AJ",
    name: "Alex Johnson",
    phone: "+1 415 555 2671",
    tag: "FRIEND",
    tone: "friend",
  },
  {
    initials: "NP",
    name: "Neha Patel",
    phone: "+91 99110 33445",
    tag: "FAMILY",
    tone: "family",
  },
  {
    initials: "RK",
    name: "Rohan Kumar",
    phone: "+91 98220 11223",
    tag: "WORK",
    tone: "work",
  },
];

const features = [
  {
    icon: "contacts",
    title: "Contacts",
    text: "Your entire network in one calm, searchable directory.",
  },
  {
    icon: "favorites",
    title: "Favorites",
    text: "Keep the people who matter most one tap away.",
  },
  {
    icon: "search",
    title: "Search",
    text: "Find anyone instantly by name, phone, or email.",
  },
  {
    icon: "categories",
    title: "Organization",
    text: "Work, family, and friends — neatly separated.",
  },
];


/*
 * Cinematic pointer response: the product preview tilts
 * in 3D while background layers drift. transform-free
 * `translate` keeps parallax apart from float keyframes;
 * everything is lerped in rAF so motion never shakes.
 * Skipped for touch pointers and reduced motion.
 */
const pageRef = ref(null);

const previewRef = ref(null);

let rafId = 0;

let running = false;

const pointer = { x: 0, y: 0 };

const smooth = { x: 0, y: 0 };


const motionAllowed = () => {
  try {
    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches
    ) {
      return false;
    }

    return window.matchMedia(
      "(pointer: fine)",
    ).matches;
  } catch {
    return false;
  }
};


const loop = () => {
  if (!running) {
    return;
  }

  smooth.x += (pointer.x - smooth.x) * 0.055;
  smooth.y += (pointer.y - smooth.y) * 0.055;

  pageRef.value?.style.setProperty(
    "--px",
    `${(smooth.x * 16).toFixed(2)}px`,
  );

  pageRef.value?.style.setProperty(
    "--py",
    `${(smooth.y * 16).toFixed(2)}px`,
  );

  if (previewRef.value) {
    previewRef.value.style.transform =
      `rotateX(${(-smooth.y * 5).toFixed(2)}deg) ` +
      `rotateY(${(smooth.x * 7).toFixed(2)}deg)`;
  }

  rafId = requestAnimationFrame(loop);
};


const onPointerMove = (event) => {
  pointer.x =
    event.clientX / window.innerWidth - 0.5;

  pointer.y =
    event.clientY / window.innerHeight - 0.5;
};


const observeReveals = () => {
  const targets =
    pageRef.value?.querySelectorAll(".reveal");

  if (!targets || targets.length === 0) {
    return () => {};
  }

  if (typeof IntersectionObserver === "undefined") {
    targets.forEach((el) => el.classList.add("in"));
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  targets.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
};


let stopReveals = () => {};


onMounted(() => {
  stopReveals = observeReveals();

  if (!motionAllowed()) {
    return;
  }

  running = true;

  window.addEventListener(
    "pointermove",
    onPointerMove,
    { passive: true },
  );

  rafId = requestAnimationFrame(loop);
});


onBeforeUnmount(() => {
  running = false;

  cancelAnimationFrame(rafId);

  window.removeEventListener(
    "pointermove",
    onPointerMove,
  );

  stopReveals();
});
</script>
