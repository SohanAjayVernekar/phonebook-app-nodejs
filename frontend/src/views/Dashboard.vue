<template>
  <section class="dashboard-page">

    <!-- =====================================================
         HERO — welcome message + today's date pill
    ====================================================== -->

    <div class="dashboard-heading">

      <div>
        <span class="section-label">
          OVERVIEW
        </span>

        <h1>
          {{ dayGreeting }}{{ firstName ? ", " + firstName : "" }}
        </h1>

        <p>
          Here's what's happening across your network.
        </p>
      </div>


      <div class="dashboard-date">
        <span>
          TODAY
        </span>

        <strong>
          {{ todayLabel }}
        </strong>
      </div>

    </div>


    <!-- =====================================================
         YOUR NETWORK
    ====================================================== -->

    <section
      class="net-panel"
      :aria-busy="statsLoading"
      aria-label="Your network"
    >

      <div class="net-head">

        <div>
          <span class="section-label">
            YOUR NETWORK
          </span>

          <h2>
            Where your people live
          </h2>
        </div>


        <strong class="net-total">
          {{ displayTotal }} contacts
        </strong>

      </div>


      <ul class="net-bars">

        <li
          v-for="row in netRows"
          :key="row.value"
        >

          <div class="net-row-top">
            <span>{{ row.label }}</span>
            <strong>{{ row.text }}</strong>
          </div>

          <div class="net-track">
            <div
              class="net-fill"
              :class="row.bar"
              :style="{ width: row.width + '%' }"
            ></div>
          </div>

        </li>

      </ul>


      <div class="net-links">

        <router-link
          to="/favorites"
          class="net-link"
        >
          <span>
            Favorites
            <strong>{{ displayFav }}</strong>
          </span>

          <span
            class="net-arrow"
            aria-hidden="true"
          >
            &rarr;
          </span>
        </router-link>


        <router-link
          to="/categories"
          class="net-link"
        >
          <span>
            Browse categories
          </span>

          <span
            class="net-arrow"
            aria-hidden="true"
          >
            &rarr;
          </span>
        </router-link>

      </div>

    </section>



    <!-- =====================================================
         QUICK ACTIONS
    ====================================================== -->

    <div class="dash-actions">

      <router-link
        to="/contacts/new"
        class="primary-button dash-action-link"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="ICONS.plus" />
        </svg>

        <span>
          Add Contact
        </span>
      </router-link>


      <router-link
        to="/import"
        class="primary-button secondary-button dash-action-link"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="ICONS.import" />
        </svg>

        <span>
          Import CSV
        </span>
      </router-link>


      <router-link
        to="/export"
        class="primary-button secondary-button dash-action-link"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="ICONS.export" />
        </svg>

        <span>
          Export
        </span>
      </router-link>

    </div>


    <!-- =====================================================
         RECENT CONTACTS — latest 5, newest first
    ====================================================== -->

    <section
      class="dash-panel"
      aria-labelledby="dash-recent-title"
    >


      <!-- PANEL HEADER -->
      <div class="dash-panel-head">

        <div>
          <span class="section-label">
            LATEST
          </span>

          <h2 id="dash-recent-title">
            Recent contacts
          </h2>
        </div>


        <router-link
          to="/contacts"
          class="primary-button secondary-button dash-action-link"
        >
          <span>
            View all
          </span>
        </router-link>

      </div>


      <!-- LOADING -->
      <div
        v-if="recentLoading"
        class="dash-recent"
        role="status"
        aria-label="Loading recent contacts"
      >

        <div
          v-for="n in 3"
          :key="'recent-skeleton-' + n"
          class="skeleton-card dash-skeleton-row"
        >
          <span class="skeleton-shimmer skeleton-avatar"></span>

          <div class="skeleton-lines">
            <span class="skeleton-shimmer skeleton-line w-60"></span>
            <span class="skeleton-shimmer skeleton-line w-35"></span>
          </div>
        </div>

      </div>


      <!-- ERROR -->
      <div
        v-else-if="recentError"
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
          Unable to load recent contacts
        </h2>


        <p>
          {{ recentError }}
        </p>


        <button
          type="button"
          class="primary-button"
          @click="loadRecent"
        >
          Try Again
        </button>

      </div>


      <!-- EMPTY PHONEBOOK -->
      <div
        v-else-if="recent.length === 0"
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
            <path :d="ICONS.contacts" />
          </svg>
        </div>


        <h2>
          No contacts yet
        </h2>


        <p>
          Add your first contact and it will
          appear right here.
        </p>


        <router-link
          to="/contacts/new"
          class="primary-button"
        >
          Add your first contact
        </router-link>

      </div>


      <!-- LIST -->
      <ul
        v-else
        class="dash-recent"
      >

        <li
          v-for="contact in recent"
          :key="contact.id"
        >

          <router-link
            :to="'/contacts/' + contact.id"
            class="dash-row"
          >

            <!-- Avatar initials -->
            <span
              class="dash-avatar"
              aria-hidden="true"
            >
              {{ initials(contact.name) }}
            </span>


            <!-- Name + phone -->
            <span class="dash-row-main">
              <strong class="dash-row-name">
                {{ contact.name }}
              </strong>

              <span
                class="dash-row-phone"
                :class="{ 'is-empty': !contact.phone_number }"
              >
                {{ contact.phone_number || "No phone number" }}
              </span>
            </span>


            <!-- Category chip -->
            <span
              class="dash-cat-chip"
              :class="chipClass(contact.category)"
            >
              {{ categoryLabel(contact.category) }}
            </span>


            <!-- Chevron -->
            <span
              class="dash-row-chevron"
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

        </li>

      </ul>

    </section>

  </section>
</template>


<script setup>
import {
  computed,
  onMounted,
  ref,
  watch,
} from "vue";

import { ICONS } from "../icons";

import api from "../services/api";

import { toast } from "../services/ui";

import {
  useAuthStore,
} from "../stores/authStore";

import {
  useFavorites,
} from "../composables/useFavorites";


/*
 * icons.js has no envelope — local 24×24 feather-style path.
 */
const MAIL_ICON =
  "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z " +
  "M22 6l-10 7L2 6";


/* =========================================================
   STORES
========================================================== */

const authStore = useAuthStore();

const { favoriteCount } = useFavorites();


/* =========================================================
   STATE — stats
   null means "unknown" (loading or failed → "—")
========================================================== */

const statsLoading = ref(true);

const totalContacts = ref(null);

const withEmailCount = ref(null);

const catCounts = ref({
  WORK: null,
  FAMILY: null,
  FRIEND: null,
});


/*
 * Animated counters — numbers tick up once when the
 * real values arrive. Unknown stays an em dash.
 */
const displayTotal = ref("—");

const displayFav = ref("0");

const displayEmail = ref("—");


const formatCount = (value) =>
  Number(value).toLocaleString("en-US");


const animateCount = (to, apply) => {
  if (typeof to !== "number" || Number.isNaN(to)) {
    apply("—");
    return;
  }

  let reduced = false;

  try {
    reduced =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
  } catch {
    reduced = false;
  }

  if (reduced || to <= 0) {
    apply(formatCount(to));
    return;
  }

  const duration = 700;

  const started = performance.now();

  const tick = (now) => {
    const progress = Math.min(
      1,
      (now - started) / duration,
    );

    const eased =
      1 - Math.pow(1 - progress, 3);

    apply(formatCount(Math.round(to * eased)));

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};


watch(totalContacts, (value) => {
  animateCount(value, (text) => {
    displayTotal.value = text;
  });
});

watch(
  favoriteCount,
  (value) => {
    animateCount(value ?? 0, (text) => {
      displayFav.value = text;
    });
  },
  { immediate: true },
);

watch(withEmailCount, (value) => {
  animateCount(value, (text) => {
    displayEmail.value = text;
  });
});


/* Category rows for the network panel. */
const netRows = computed(() => {
  const rows = [
    {
      value: "WORK",
      label: "Work",
      bar: "fill-work",
      count: catCounts.value.WORK,
    },
    {
      value: "FAMILY",
      label: "Family",
      bar: "fill-family",
      count: catCounts.value.FAMILY,
    },
    {
      value: "FRIEND",
      label: "Friend",
      bar: "fill-friend",
      count: catCounts.value.FRIEND,
    },
  ];

  const max = Math.max(
    1,
    ...rows.map((row) =>
      typeof row.count === "number" ? row.count : 0,
    ),
  );

  return rows.map((row) => ({
    ...row,
    text:
      typeof row.count === "number"
        ? formatCount(row.count)
        : "—",
    width:
      typeof row.count === "number"
        ? Math.max(
            row.count > 0 ? 8 : 0,
            Math.round((row.count / max) * 100),
          )
        : 0,
  }));
});


/* =========================================================
   STATE — recent contacts
========================================================== */

const recentLoading = ref(true);

const recentError = ref("");

const recent = ref([]);


/* =========================================================
   GREETING — time of day + first word of the name
========================================================== */

const dayGreeting = computed(() => {
  const hour = new Date().getHours();

  if (hour < 5) {
    return "Good night";
  }

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
});


const firstName = computed(() => {
  const name =
    authStore.user?.name?.trim() || "";

  if (!name) {
    return "";
  }

  return name.split(/\s+/)[0];
});


/* =========================================================
   TODAY'S DATE — "Mon, 23 Sep"
========================================================== */

const todayLabel = computed(() => {
  const now = new Date();

  try {
    const parts =
      new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).formatToParts(now);

    const pick = (type) =>
      parts.find((part) => part.type === type)
        ?.value || "";

    const weekday = pick("weekday");
    const day = pick("day");
    const month = pick("month");

    if (weekday && day && month) {
      return `${weekday}, ${day} ${month}`;
    }
  } catch {
    /* Intl unavailable — fall through */
  }

  return now.toLocaleDateString();
});


/* =========================================================
   LOAD STATS
   Two lightweight count queries (page_size=1).
   Each card fails independently → that card shows "—".
========================================================== */

const loadStats = async () => {
  statsLoading.value = true;

  const [totalResult, emailResult, workResult, familyResult, friendResult] =
    await Promise.allSettled([
      api.get("/contacts", {
        params: {
          page: 1,
          page_size: 1,
        },
      }),

      api.get("/contacts", {
        params: {
          page: 1,
          page_size: 1,
          has_email: "true",
        },
      }),

      api.get("/contacts", {
        params: {
          page: 1,
          page_size: 1,
          category: "WORK",
        },
      }),

      api.get("/contacts", {
        params: {
          page: 1,
          page_size: 1,
          category: "FAMILY",
        },
      }),

      api.get("/contacts", {
        params: {
          page: 1,
          page_size: 1,
          category: "FRIEND",
        },
      }),
    ]);


  totalContacts.value =
    totalResult.status === "fulfilled"
      ? Number(totalResult.value.data.total || 0)
      : null;


  withEmailCount.value =
    emailResult.status === "fulfilled"
      ? Number(emailResult.value.data.total || 0)
      : null;


  catCounts.value = {
    WORK:
      workResult.status === "fulfilled"
        ? Number(workResult.value.data.total || 0)
        : null,
    FAMILY:
      familyResult.status === "fulfilled"
        ? Number(familyResult.value.data.total || 0)
        : null,
    FRIEND:
      friendResult.status === "fulfilled"
        ? Number(friendResult.value.data.total || 0)
        : null,
  };


  statsLoading.value = false;


  if (
    totalResult.status === "rejected" ||
    emailResult.status === "rejected" ||
    workResult.status === "rejected" ||
    familyResult.status === "rejected" ||
    friendResult.status === "rejected"
  ) {
    toast(
      "error",
      "Couldn't load stats",
      "Some dashboard numbers may be missing.",
    );
  }
};


/* =========================================================
   LOAD RECENT — newest 5 contacts
========================================================== */

const loadRecent = async () => {
  recentLoading.value = true;
  recentError.value = "";

  try {
    const response =
      await api.get("/contacts", {
        params: {
          page: 1,
          page_size: 5,
          sort: "newest",
        },
      });

    recent.value =
      response.data.items || [];

  } catch (error) {
    console.error(
      "Failed to load recent contacts:",
      error,
    );

    recent.value = [];

    recentError.value =
      error?.response?.data?.detail ||
      "Unable to load recent contacts. Please try again.";

  } finally {
    recentLoading.value = false;
  }
};


/* =========================================================
   HELPERS — initials + category chip
========================================================== */

const initials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};


const CATEGORY_LABELS = {
  WORK: "Work",
  FAMILY: "Family",
  FRIEND: "Friend",
};


const categoryLabel = (category) => {
  return CATEGORY_LABELS[category] || "Unsorted";
};


const chipClass = (category) => {
  if (category === "WORK") return "is-work";
  if (category === "FAMILY") return "is-family";
  if (category === "FRIEND") return "is-friend";

  return "is-other";
};


/* =========================================================
   INITIAL LOAD
========================================================== */

onMounted(() => {
  loadStats();

  loadRecent();
});
</script>


<style scoped>
/* =========================================================
   PAGE
========================================================== */

.dashboard-page {
  width: 100%;
}


/* Numbers stay aligned while they tick */
.dashboard-num {
  font-variant-numeric: tabular-nums;
}


/* SVG inside the shared stat icon tile */
.stat-icon svg {
  width: 18px;
  height: 18px;
}


/* Skeleton placeholder standing in for a stat number */
.stat-skeleton {
  display: block;

  width: 48px;
  height: 17px;

  border-radius: 6px;
}


/* =========================================================
   QUICK ACTIONS
========================================================== */

.dash-actions {
  display: flex;
  flex-wrap: wrap;

  gap: 10px;

  margin-bottom: 20px;
}

.dash-action-link {
  flex: 0 0 auto;

  gap: 7px;
}

.dash-action-link svg {
  width: 14px;
  height: 14px;

  flex-shrink: 0;
}


/*
 * Secondary actions stay quiet — they inherit
 * .primary-button's accent glow otherwise.
 */
.dash-action-link.secondary-button {
  box-shadow: var(--shadow-sm);
}

.dash-action-link.secondary-button:hover {
  box-shadow: var(--shadow-md);
}


/* =========================================================
   RECENT CONTACTS PANEL
   glass card on --bg-app
========================================================== */

.dash-panel {
  padding: 24px;

  border: 1px solid var(--border-glass);
  border-radius: 22px;

  background: var(--bg-glass);

  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);

  box-shadow: var(--shadow-md);
}


.dash-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;

  margin-bottom: 14px;
}

.dash-panel-head h2 {
  margin: 6px 0 0;

  color: var(--text-primary);

  font-size: 19px;
  font-weight: 850;

  letter-spacing: -0.3px;
}


/* =========================================================
   ROWS
========================================================== */

.dash-recent {
  display: flex;
  flex-direction: column;

  gap: 4px;

  margin: 0;
  padding: 0;

  list-style: none;
}


.dash-row {
  display: flex;
  align-items: center;

  gap: 13px;

  min-width: 0;

  padding: 11px 12px;

  border-radius: 14px;

  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

.dash-row:hover {
  background: var(--bg-hover);

  transform: translateY(-2px);
}


.dash-avatar {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 12px;

  background: linear-gradient(
    135deg,
    var(--accent-soft-hover),
    var(--accent-soft)
  );

  border: 1px solid var(--accent-border);

  color: var(--accent-text);

  font-size: 12px;
  font-weight: 850;
}


.dash-row-main {
  flex: 1;

  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 3px;
}


.dash-row-name {
  color: var(--text-primary);

  font-size: 13.5px;
  font-weight: 750;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.dash-row-phone {
  color: var(--text-muted);

  font-size: 11.5px;

  font-variant-numeric: tabular-nums;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dash-row-phone.is-empty {
  color: var(--text-faint);
  font-style: italic;
}


/* Category chip — --cat-* tokens keep both themes intact */
.dash-cat-chip {
  flex-shrink: 0;

  padding: 5px 11px;

  border-radius: 999px;

  background: var(--bg-inset);
  color: var(--text-muted);

  font-size: 9px;
  font-weight: 850;

  letter-spacing: 0.6px;
}

.dash-cat-chip.is-work {
  background: var(--cat-work-bg);
  color: var(--cat-work-fg);
}

.dash-cat-chip.is-family {
  background: var(--cat-family-bg);
  color: var(--cat-family-fg);
}

.dash-cat-chip.is-friend {
  background: var(--cat-friend-bg);
  color: var(--cat-friend-fg);
}


.dash-row-chevron {
  flex-shrink: 0;

  display: flex;

  color: var(--text-faint);
}

.dash-row-chevron svg {
  width: 15px;
  height: 15px;
}


/* =========================================================
   STATES — icon sizing inside the shared 56px tile
========================================================== */

.empty-icon svg {
  width: 24px;
  height: 24px;
}


.dash-skeleton-row {
  padding: 11px 12px;

  border-radius: 14px;
}


/* =========================================================
   RESPONSIVE
========================================================== */

@media (max-width: 720px) {
  .dash-panel {
    padding: 18px;
  }

  .dash-panel-head {
    flex-wrap: wrap;
  }

  .dash-cat-chip {
    display: none;
  }
}
</style>
