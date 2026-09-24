<template>
  <section class="profile-page">

    <!-- =====================================================
         PAGE HEADING
    ====================================================== -->

    <div class="dashboard-heading">

      <div>
        <span class="section-label">
          PREFERENCES
        </span>

        <h1>
          Settings
        </h1>

        <p>
          Tune the app&apos;s appearance and how
          contacts are displayed.
        </p>
      </div>


      <div class="dashboard-date">
        <span>
          SAVED ON
        </span>

        <strong>
          This device
        </strong>
      </div>

    </div>


    <!-- =====================================================
         SETTINGS GRID
    ====================================================== -->

    <div class="settings-grid">


      <!-- ===================================================
           APPEARANCE
      ==================================================== -->

      <section class="settings-card">

        <div class="settings-card-title">
          <span class="settings-icon indigo">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path
                :d="ui.isDark ? ICONS.moon : ICONS.sun"
              />
            </svg>
          </span>

          <div>
            <h2>Appearance</h2>
            <p>Light or dark theme — applied instantly.</p>
          </div>
        </div>


        <div class="setting-row">

          <div class="setting-text">
            <strong>Theme</strong>
            <span>Remembered on this device.</span>
          </div>


          <div
            class="segmented"
            role="group"
            aria-label="Theme"
          >
            <button
              type="button"
              :class="{ active: ui.theme === 'light' }"
              :aria-pressed="ui.theme === 'light'"
              @click="ui.setTheme('light')"
            >
              Light
            </button>

            <button
              type="button"
              :class="{ active: ui.theme === 'dark' }"
              :aria-pressed="ui.theme === 'dark'"
              @click="ui.setTheme('dark')"
            >
              Dark
            </button>
          </div>

        </div>


        <p class="settings-note">
          The sidebar, topbar and every page follow
          this choice.
        </p>

      </section>


      <!-- ===================================================
           CONTACT DISPLAY
      ==================================================== -->

      <section class="settings-card">

        <div class="settings-card-title">
          <span class="settings-icon violet">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path :d="ICONS.settings" />
            </svg>
          </span>

          <div>
            <h2>Contact display</h2>
            <p>How contacts are displayed — saved on this device.</p>
          </div>
        </div>


        <!-- Contact view -->
        <div class="setting-row">

          <div class="setting-text">
            <strong>Contact view</strong>
            <span>Grid cards or the data table.</span>
          </div>


          <div
            class="segmented"
            role="group"
            aria-label="Contact view"
          >
            <button
              type="button"
              :class="{ active: viewMode === 'grid' }"
              :aria-pressed="viewMode === 'grid'"
              @click="viewMode = 'grid'"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path :d="ICONS.dashboard" />
              </svg>
              Grid
            </button>

            <button
              type="button"
              :class="{ active: viewMode === 'list' }"
              :aria-pressed="viewMode === 'list'"
              @click="viewMode = 'list'"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path :d="ICONS.table" />
              </svg>
              Table
            </button>
          </div>

        </div>


        <!-- Row density -->
        <div class="setting-row">

          <div class="setting-text">
            <strong>Row density</strong>
            <span>Spacing of table rows and contact cards.</span>
          </div>


          <div
            class="segmented"
            role="group"
            aria-label="Row density"
          >
            <button
              type="button"
              :class="{ active: density === 'comfortable' }"
              :aria-pressed="density === 'comfortable'"
              @click="density = 'comfortable'"
            >
              Comfortable
            </button>

            <button
              type="button"
              :class="{ active: density === 'compact' }"
              :aria-pressed="density === 'compact'"
              @click="density = 'compact'"
            >
              Compact
            </button>
          </div>

        </div>


        <p class="settings-note">
          Changes apply the next time you open
          the contacts list.
        </p>

      </section>

    </div>

  </section>
</template>


<script setup>
import {
  ref,
  watch,
} from "vue";

import {
  useUiStore,
} from "../stores/uiStore";

import {
  ICONS,
} from "../icons";


/* =========================================================
   THEME (persisted by the UI store under pb.theme)
========================================================= */

const ui = useUiStore();


/* =========================================================
   CONTACT DISPLAY (same keys as the contacts list)
========================================================= */

const readPref = (key, fallback) => {
  return localStorage.getItem(key) || fallback;
};


const writePref = (key, value) => {
  localStorage.setItem(key, value);
};


const viewMode = ref(
  readPref("contacts_view_mode", "grid")
);


const density = ref(
  readPref("contacts_density", "comfortable")
);


watch(
  viewMode,
  (value) => writePref("contacts_view_mode", value)
);


watch(
  density,
  (value) => writePref("contacts_density", value)
);
</script>
