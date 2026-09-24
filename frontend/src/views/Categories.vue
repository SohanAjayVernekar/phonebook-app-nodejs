<template>
  <section class="categories-page">

    <!-- =====================================================
         PAGE HEADING
    ====================================================== -->

    <div class="categories-hero">

      <span class="section-label">
        GROUPS
      </span>

      <h1>
        Categories
      </h1>

      <p>
        Organise contacts into categories.
      </p>

    </div>


    <!-- =====================================================
         LOADING — skeleton tiles
    ====================================================== -->

    <div
      v-if="loading"
      class="cat-grid"
      role="status"
      aria-label="Loading categories"
    >

      <div
        v-for="entry in CATEGORIES"
        :key="'cat-skeleton-' + entry.key"
        class="cat-tile skeleton-card"
        aria-hidden="true"
      >

        <span class="skeleton-shimmer cat-tile-skeleton-icon"></span>

        <div class="skeleton-lines">
          <span class="skeleton-shimmer skeleton-line w-60"></span>
          <span class="skeleton-shimmer skeleton-line w-35"></span>
        </div>

      </div>

    </div>


    <!-- =====================================================
         ERROR — retry
    ====================================================== -->

    <div
      v-else-if="error"
      class="message error"
    >

      <div class="empty-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="ICONS.alertTriangle" />
        </svg>
      </div>


      <h2>
        Unable to load categories
      </h2>


      <p>
        {{ error }}
      </p>


      <button
        type="button"
        class="primary-button"
        @click="loadCounts"
      >
        Try Again
      </button>

    </div>


    <!-- =====================================================
         CATEGORY TILES — click through to the filtered list
    ====================================================== -->

    <div
      v-else
      class="cat-grid"
    >

      <router-link
        v-for="entry in CATEGORIES"
        :key="entry.key"
        :to="'/contacts?categories=' + entry.value"
        class="cat-tile"
        :class="'cat-tile--' + entry.key"
      >

        <!-- Coloured icon tile -->
        <span
          class="cat-tile-icon"
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
            <path :d="entry.icon" />
          </svg>
        </span>


        <!-- Name + count -->
        <span class="cat-tile-body">

          <span class="cat-tile-name">
            <i
              class="cat-tile-dot"
              aria-hidden="true"
            ></i>

            <strong>
              {{ entry.label }}
            </strong>
          </span>


          <span class="cat-tile-count">
            <strong class="cat-tile-number">
              {{ countFor(entry.value) }}
            </strong>

            <span class="cat-tile-count-word">
              {{ countFor(entry.value) === 1 ? "contact" : "contacts" }}
            </span>
          </span>

        </span>


        <!-- Chevron -->
        <span
          class="cat-tile-chevron"
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
            <path :d="ICONS.chevronRight" />
          </svg>
        </span>

      </router-link>

    </div>


    <!-- =====================================================
         COVERAGE — stacked share bar + legend
    ====================================================== -->

    <section
      v-if="!loading && !error"
      class="cat-coverage"
      aria-labelledby="cat-coverage-title"
    >


      <!-- HEADER -->
      <div class="cat-coverage-head">

        <div>
          <span class="section-label">
            SPLIT
          </span>

          <h2 id="cat-coverage-title">
            Category coverage
          </h2>
        </div>


        <span class="contact-count">
          {{ grandTotal }} total
        </span>

      </div>


      <!-- NOTHING TO CHART YET -->
      <div
        v-if="grandTotal === 0"
        class="message empty"
      >

        <div class="empty-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path :d="ICONS.categories" />
          </svg>
        </div>


        <h2>
          No contacts to categorise yet
        </h2>


        <p>
          Create your first contact and give it a
          category — work, family or friends.
        </p>


        <router-link
          to="/contacts/new"
          class="primary-button"
        >
          Add your first contact
        </router-link>

      </div>


      <!-- STACKED BAR -->
      <template v-else>

        <div
          class="cat-bar"
          role="img"
          :aria-label="coverageSummary"
        >

          <span
            class="cat-bar-seg cat-bar-seg--work"
            :style="{ width: segmentWidths.WORK + '%' }"
          ></span>

          <span
            class="cat-bar-seg cat-bar-seg--family"
            :style="{ width: segmentWidths.FAMILY + '%' }"
          ></span>

          <span
            class="cat-bar-seg cat-bar-seg--friend"
            :style="{ width: segmentWidths.FRIEND + '%' }"
          ></span>

        </div>


        <!-- LEGEND -->
        <ul class="cat-legend">

          <li
            v-for="entry in CATEGORIES"
            :key="'legend-' + entry.key"
            class="cat-legend-item"
          >

            <i
              class="cat-legend-dot"
              :class="'is-' + entry.key"
              aria-hidden="true"
            ></i>

            <span class="cat-legend-label">
              {{ entry.label }}
            </span>

            <strong class="cat-legend-value">
              {{ segmentWidths[entry.value] }}%
            </strong>

            <span class="cat-legend-count">
              ({{ countFor(entry.value) }})
            </span>

          </li>

        </ul>

      </template>

    </section>

  </section>
</template>


<script setup>
import {
  computed,
  onMounted,
  reactive,
  ref,
} from "vue";

import { ICONS } from "../icons";

import api from "../services/api";


/* =========================================================
   LOCAL ICON PATHS
   icons.js has no briefcase / home — feather-style 24×24.
========================================================== */

const BRIEFCASE_ICON =
  "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z " +
  "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16";

const HOME_ICON =
  "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z " +
  "M9 22V12h6v10";


/* =========================================================
   CATEGORY MODEL
   value → API ?category=  ·  key → scoped CSS modifier
========================================================== */

const CATEGORIES = [
  {
    key: "work",
    label: "Work",
    value: "WORK",
    icon: BRIEFCASE_ICON,
  },
  {
    key: "family",
    label: "Family",
    value: "FAMILY",
    icon: HOME_ICON,
  },
  {
    key: "friend",
    label: "Friend",
    value: "FRIEND",
    icon: ICONS.contacts,
  },
];


/* =========================================================
   STATE
========================================================== */

const loading = ref(true);

const error = ref("");

const counts = reactive({
  WORK: 0,
  FAMILY: 0,
  FRIEND: 0,
});


/* =========================================================
   LOAD COUNTS — one page_size=1 query per category,
   run in parallel so a single failure fails the page
   (one shared error + retry, per the brief).
========================================================== */

const loadCounts = async () => {
  loading.value = true;
  error.value = "";

  try {
    const responses =
      await Promise.all(
        CATEGORIES.map((entry) =>
          api.get("/contacts", {
            params: {
              page: 1,
              page_size: 1,
              category: entry.value,
            },
          })
        )
      );

    CATEGORIES.forEach((entry, index) => {
      counts[entry.value] = Number(
        responses[index].data.total || 0
      );
    });

  } catch (err) {
    console.error(
      "Failed to load category counts:",
      err,
    );

    error.value =
      err?.response?.data?.detail ||
      "Unable to load category totals. Please try again.";

  } finally {
    loading.value = false;
  }
};


/* =========================================================
   DERIVED — totals + exact 100% share split
========================================================== */

const grandTotal = computed(() => {
  return (
    counts.WORK +
    counts.FAMILY +
    counts.FRIEND
  );
});


const countFor = (value) => {
  return counts[value] ?? 0;
};


/*
 * Largest-remainder rounding so the three
 * widths always add up to exactly 100%.
 */
const segmentWidths = computed(() => {
  const total = grandTotal.value;

  if (total === 0) {
    return { WORK: 0, FAMILY: 0, FRIEND: 0 };
  }

  const exact = CATEGORIES.map(
    (entry) => (counts[entry.value] / total) * 100
  );

  const floored = exact.map((value) =>
    Math.floor(value)
  );

  let leftover =
    100 - floored.reduce((sum, v) => sum + v, 0);


  /* hand the remaining percent to the largest fractions */
  const byFraction = exact
    .map((value, index) => ({
      index,
      fraction: value - Math.floor(value),
    }))
    .sort((a, b) => b.fraction - a.fraction);

  const result = [...floored];

  for (const { index } of byFraction) {
    if (leftover <= 0) break;

    result[index] += 1;
    leftover -= 1;
  }

  return {
    WORK: result[0],
    FAMILY: result[1],
    FRIEND: result[2],
  };
});


const coverageSummary = computed(() => {
  return CATEGORIES.map(
    (entry) =>
      `${entry.label} ${segmentWidths.value[entry.value]}%`
  ).join(", ");
});


/* =========================================================
   INITIAL LOAD
========================================================== */

onMounted(() => {
  loadCounts();
});
</script>


<style scoped>
/* =========================================================
   PAGE HEADING — glass panel, h1 + muted subtitle
========================================================== */

.categories-page {
  width: 100%;
}


.categories-hero {
  margin-bottom: 20px;
  padding: 20px 24px;

  border: 1px solid var(--border-glass);
  border-radius: 20px;

  background: var(--bg-glass);

  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);

  box-shadow: var(--shadow-md);
}

.categories-hero h1 {
  margin: 6px 0 0;

  color: var(--text-primary);

  font-size: 27px;
  font-weight: 850;

  letter-spacing: -0.6px;
}

.categories-hero p {
  margin: 7px 0 0;

  color: var(--text-muted);

  font-size: 12px;
}


/* =========================================================
   TILE GRID — 3 across, 1 column under ~720px
========================================================== */

.cat-grid {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 16px;

  margin-bottom: 20px;
}


.cat-tile {
  display: flex;
  align-items: center;

  gap: 15px;

  min-width: 0;
  min-height: 96px;

  padding: 20px;

  border: 1px solid var(--border);
  border-radius: 18px;

  background: var(--bg-glass);

  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);

  box-shadow: var(--shadow-sm);

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.cat-tile:hover {
  transform: translateY(-2px);

  box-shadow: var(--shadow-md);
}


/* Coloured icon tile (cat tokens) */
.cat-tile-icon {
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 14px;

  background: var(--bg-inset);
  color: var(--text-muted);
}

.cat-tile-icon svg {
  width: 21px;
  height: 21px;
}

.cat-tile--work .cat-tile-icon {
  background: var(--cat-work-bg);
  color: var(--cat-work-fg);
}

.cat-tile--family .cat-tile-icon {
  background: var(--cat-family-bg);
  color: var(--cat-family-fg);
}

.cat-tile--friend .cat-tile-icon {
  background: var(--cat-friend-bg);
  color: var(--cat-friend-fg);
}


/* Body: name row + count row */
.cat-tile-body {
  flex: 1;

  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 6px;
}


.cat-tile-name {
  display: flex;
  align-items: center;

  gap: 8px;

  min-width: 0;
}

.cat-tile-name strong {
  color: var(--text-primary);

  font-size: 15px;
  font-weight: 850;

  letter-spacing: -0.2px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


/* Coloured dot — matches the icon tint */
.cat-tile-dot {
  width: 8px;
  height: 8px;

  flex-shrink: 0;

  border-radius: 50%;

  background: var(--text-faint);
}

.cat-tile--work .cat-tile-dot {
  background: var(--cat-work-fg);
  box-shadow: 0 0 0 3px var(--cat-work-bg);
}

.cat-tile--family .cat-tile-dot {
  background: var(--cat-family-fg);
  box-shadow: 0 0 0 3px var(--cat-family-bg);
}

.cat-tile--friend .cat-tile-dot {
  background: var(--cat-friend-fg);
  box-shadow: 0 0 0 3px var(--cat-friend-bg);
}


.cat-tile-count {
  display: flex;
  align-items: baseline;

  gap: 6px;

  min-width: 0;
}

.cat-tile-number {
  color: var(--text-primary);

  font-size: 20px;
  font-weight: 850;

  font-variant-numeric: tabular-nums;
}

.cat-tile-count-word {
  color: var(--text-muted);

  font-size: 11px;
}


.cat-tile-chevron {
  flex-shrink: 0;

  display: flex;

  color: var(--text-faint);

  transition:
    color 0.18s ease,
    transform 0.18s var(--ease-premium, cubic-bezier(0.22, 1, 0.36, 1));
}

.cat-tile:hover .cat-tile-chevron {
  color: var(--accent-text);

  transform: translateX(3px);
}

.cat-tile-chevron svg {
  width: 17px;
  height: 17px;
}


/* =========================================================
   COVERAGE PANEL
========================================================== */

.cat-coverage {
  padding: 24px;

  border: 1px solid var(--border-glass);
  border-radius: 22px;

  background: var(--bg-glass);

  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);

  box-shadow: var(--shadow-md);
}


.cat-coverage-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;

  margin-bottom: 18px;
}

.cat-coverage-head h2 {
  margin: 6px 0 0;

  color: var(--text-primary);

  font-size: 18px;
  font-weight: 850;

  letter-spacing: -0.3px;
}


/* =========================================================
   STACKED BAR — widths are inline % from counts
========================================================== */

.cat-bar {
  display: flex;

  width: 100%;
  height: 16px;

  overflow: hidden;

  border-radius: 999px;

  background: var(--bg-inset);

  border: 1px solid var(--border-subtle);
}


.cat-bar-seg {
  height: 100%;

  min-width: 0;

  transition: width 0.3s ease;
}

.cat-bar-seg--work {
  background: var(--cat-work-fg);
}

.cat-bar-seg--family {
  background: var(--cat-family-fg);
}

.cat-bar-seg--friend {
  background: var(--cat-friend-fg);
}


/* =========================================================
   LEGEND
========================================================== */

.cat-legend {
  display: flex;
  flex-wrap: wrap;

  gap: 10px 26px;

  margin: 16px 0 0;
  padding: 0;

  list-style: none;
}


.cat-legend-item {
  display: flex;
  align-items: center;

  gap: 8px;

  min-width: 0;
}


.cat-legend-dot {
  width: 9px;
  height: 9px;

  flex-shrink: 0;

  border-radius: 50%;
}

.cat-legend-dot.is-work {
  background: var(--cat-work-fg);
}

.cat-legend-dot.is-family {
  background: var(--cat-family-fg);
}

.cat-legend-dot.is-friend {
  background: var(--cat-friend-fg);
}


.cat-legend-label {
  color: var(--text-secondary);

  font-size: 11.5px;
  font-weight: 700;
}


.cat-legend-value {
  color: var(--text-primary);

  font-size: 11.5px;
  font-weight: 850;

  font-variant-numeric: tabular-nums;
}


.cat-legend-count {
  color: var(--text-faint);

  font-size: 11px;

  font-variant-numeric: tabular-nums;
}


/* =========================================================
   STATES — icon sizing inside the shared 56px tile
========================================================== */

.empty-icon svg {
  width: 24px;
  height: 24px;
}


/* Skeleton tile icon (pairs with .skeleton-shimmer) */
.cat-tile-skeleton-icon {
  width: 48px;
  height: 48px;

  flex-shrink: 0;

  border-radius: 14px;
}


/* =========================================================
   RESPONSIVE
========================================================== */

@media (max-width: 720px) {
  .cat-grid {
    grid-template-columns: 1fr;
  }

  .cat-coverage {
    padding: 18px;
  }

  .cat-coverage-head {
    flex-wrap: wrap;
  }
}
</style>
