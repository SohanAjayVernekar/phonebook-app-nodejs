<template>
  <section class="not-found">

    <!-- =====================================================
         ICON TILE — decorative, gently floating
    ====================================================== -->

    <div
      class="nf-icon"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path :d="ICONS.alertTriangle" />
      </svg>
    </div>


    <!-- =====================================================
         BIG 404 — gradient text, purely decorative
    ====================================================== -->

    <span
      class="nf-code"
      aria-hidden="true"
    >
      404
    </span>


    <!-- =====================================================
         COPY
    ====================================================== -->

    <h1>Page not found</h1>

    <p>
      The page you&apos;re looking for doesn&apos;t
      exist or has been moved.
    </p>


    <!-- =====================================================
         ACTIONS
    ====================================================== -->

    <div class="nf-actions">
      <router-link
        to="/dashboard"
        class="primary-button"
      >
        Back to Dashboard
      </router-link>

      <router-link
        to="/contacts"
        class="secondary-button"
      >
        Go to Contacts
      </router-link>
    </div>

  </section>
</template>


<script setup>
import { ICONS } from "../icons";
</script>


<style scoped>
/* =========================================================
   LAYOUT — centered column inside the app shell
======================================================== */

.not-found {
  width: 100%;

  min-height: 60vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 48px 16px;

  text-align: center;
}


/* =========================================================
   ICON TILE — accent tint + float animation
======================================================== */

.nf-icon {
  width: 64px;
  height: 64px;

  display: grid;
  place-items: center;

  border: 1px solid var(--accent-border);
  border-radius: 18px;

  background: var(--accent-soft);

  color: var(--accent-text);

  box-shadow:
    0 12px 26px rgba(var(--accent-rgb), 0.16);

  animation:
    nf-float 0.6s ease-in-out alternate infinite;
}

.nf-icon svg {
  width: 30px;
  height: 30px;
}

@keyframes nf-float {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-6px);
  }
}


/* =========================================================
   404 — mirrors the dashboard heading gradient
======================================================== */

.nf-code {
  margin-top: 24px;

  background:
    linear-gradient(
      120deg,
      var(--text-primary) 55%,
      var(--accent-hover)
    );

  -webkit-background-clip: text;
  background-clip: text;

  -webkit-text-fill-color: transparent;
  color: transparent;

  font-size: clamp(64px, 16vw, 86px);
  font-weight: 850;

  letter-spacing: -2px;

  line-height: 1;
}


/* =========================================================
   COPY
======================================================== */

.not-found h1 {
  margin: 16px 0 0;

  color: var(--text-primary);

  font-size: clamp(24px, 5vw, 32px);
  font-weight: 850;

  letter-spacing: -0.6px;
}

.not-found p {
  max-width: 440px;

  margin: 11px 0 0;

  color: var(--text-muted);

  font-size: 13px;

  line-height: 1.65;
}


/* =========================================================
   ACTIONS
======================================================== */

.nf-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  gap: 10px;

  margin-top: 28px;
}


/*
 * Router-links reuse the global button classes but
 * live outside .form-actions, so sizing is supplied
 * here (layout only — colours stay global).
 */
.nf-actions .primary-button,
.nf-actions .secondary-button {
  min-height: 44px;

  padding: 0 20px;

  border-radius: 11px;

  font-size: 12px;
  font-weight: 800;

  text-align: center;

  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.nf-actions .secondary-button {
  flex: 0 0 auto;
}


/* =========================================================
   RESPONSIVE
======================================================== */

@media (max-width: 720px) {
  .not-found {
    min-height: 55vh;

    padding: 40px 8px;
  }

  .nf-actions {
    width: 100%;
  }

  .nf-actions .primary-button,
  .nf-actions .secondary-button {
    width: 100%;
  }
}
</style>
