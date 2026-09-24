<template>
  <section class="favorites-page">

    <!-- =====================================================
         HERO — page heading + starred count pill
    ====================================================== -->

    <div class="dashboard-heading fav-heading">

      <div>
        <span class="section-label">
          FAVORITES
        </span>

        <h1>
          Favorites
        </h1>

        <p>
          Contacts you&apos;ve starred, one tap away.
        </p>
      </div>


      <!-- Starred count — localStorage pb.favorites is the source of truth -->
      <div class="contact-count fav-count-pill">

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            :d="ICONS.favorites"
            fill="currentColor"
          />
        </svg>

        <strong>
          {{ favoriteCount }}
        </strong>

        <span>
          starred
        </span>

      </div>

    </div>


    <!-- =====================================================
         LOADING — 6 skeleton tiles
    ====================================================== -->

    <div
      v-if="loading"
      class="fav-grid"
    >

      <p
        class="fav-sr-only"
        role="status"
      >
        Loading your favorites…
      </p>


      <div
        v-for="n in 6"
        :key="`fav-skeleton-${n}`"
        class="skeleton-card fav-skeleton"
        aria-hidden="true"
      >

        <span class="skeleton-shimmer skeleton-avatar"></span>

        <span class="skeleton-lines">
          <span class="skeleton-shimmer skeleton-line w-80"></span>

          <span class="skeleton-shimmer skeleton-line w-60"></span>

          <span class="skeleton-shimmer skeleton-pill"></span>
        </span>

      </div>

    </div>


    <!-- =====================================================
         ERROR — fetch failed, retry available
    ====================================================== -->

    <div
      v-else-if="error"
      class="message error"
      role="alert"
    >

      <h2>
        Couldn&apos;t load favorites
      </h2>

      <p>
        {{ error }}
      </p>

      <button
        type="button"
        class="primary-button"
        @click="loadFavorites"
      >
        Try again
      </button>

    </div>


    <!-- =====================================================
         EMPTY — nothing starred locally
    ====================================================== -->

    <div
      v-else-if="favoriteCount === 0"
      class="message empty"
    >

      <span class="empty-icon fav-empty-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="ICONS.favorites" />
        </svg>
      </span>

      <h2>
        No favorites yet
      </h2>

      <p>
        Star contacts to keep them within quick reach.
      </p>

      <router-link
        to="/contacts"
        class="primary-button"
      >
        Browse contacts
      </router-link>

    </div>


    <!-- =====================================================
         EMPTY — starred ids exist but their contacts do not
                 (deleted from the address book)
    ====================================================== -->

    <div
      v-else-if="favoriteContacts.length === 0"
      class="message empty"
    >

      <span class="empty-icon fav-empty-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="ICONS.favorites" />
        </svg>
      </span>

      <h2>
        Starred contacts unavailable
      </h2>

      <p>
        The contacts you starred are no longer
        in your address book.
      </p>

      <router-link
        to="/contacts"
        class="primary-button"
      >
        Browse contacts
      </router-link>

    </div>


    <!-- =====================================================
         GRID — scoped favorite cards (no ContactCard import)
    ====================================================== -->

    <TransitionGroup
      v-else
      tag="div"
      name="fav-pop"
      class="fav-grid"
    >

      <article
        v-for="contact in favoriteContacts"
        :key="contact.id"
        class="fav-card"
        @click="openContact(contact.id)"
      >

        <!-- Remove star (top-right) -->
        <button
          type="button"
          class="fav-star"
          :class="{ 'is-starred': isFavorite(contact.id) }"
          :aria-label="
            isFavorite(contact.id)
              ? `Remove ${contact.name} from favorites`
              : `Add ${contact.name} to favorites`
          "
          @click.stop="toggleStar(contact)"
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
            <path
              :d="ICONS.favorites"
              :fill="isFavorite(contact.id) ? 'currentColor' : 'none'"
            />
          </svg>
        </button>


        <!-- Avatar + name + category -->
        <div class="fav-card-head">

          <span
            class="fav-avatar"
            aria-hidden="true"
          >
            {{ initials(contact.name) }}
          </span>

          <div class="fav-identity">

            <router-link
              class="fav-name-link"
              :to="`/contacts/${contact.id}`"
              @click.stop
            >
              <strong class="fav-name">
                {{ contact.name }}
              </strong>
            </router-link>

            <span
              class="contact-category"
              :class="categoryClass(contact.category)"
            >
              {{ categoryLabel(contact.category) }}
            </span>

          </div>

        </div>


        <!-- Phone -->
        <a
          class="fav-line fav-phone"
          :href="phoneLink(contact.phone_number)"
          :title="contact.phone_number"
          @click.stop
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
            <path :d="ICONS.phone" />
          </svg>

          <span>{{ contact.phone_number }}</span>
        </a>


        <!-- Email (or muted fallback) -->
        <a
          v-if="contact.email"
          class="fav-line fav-email"
          :href="`mailto:${contact.email}`"
          :title="contact.email"
          @click.stop
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
            <path :d="MAIL_ICON" />
          </svg>

          <span>{{ contact.email }}</span>
        </a>

        <span
          v-else
          class="fav-line fav-email is-missing"
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
            <path :d="MAIL_ICON" />
          </svg>

          <span>No email on file</span>
        </span>

      </article>

    </TransitionGroup>

  </section>
</template>


<script setup>
import {
  computed,
  onMounted,
  ref,
} from "vue";

import {
  useRouter,
} from "vue-router";

import { ICONS } from "../icons";

import api from "../services/api";

import { toast } from "../services/ui";

import {
  useFavorites,
} from "../composables/useFavorites";


/* =========================================================
   LOCAL ICON — icons.js has no envelope, so the feather-
   style mail path lives here (src/icons.js stays untouched).
========================================================== */

const MAIL_ICON =
  "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z " +
  "M22 6l-10 7L2 6";


/* =========================================================
   ROUTER + FAVORITES
   localStorage pb.favorites decides membership — the
   backend has no favorite field and GET /contacts has no
   favorite filter parameter.
========================================================== */

const router = useRouter();

const {
  favorites,
  favoriteCount,
  isFavorite,
  toggleFavorite,
} = useFavorites();


/* =========================================================
   STATE
   loading starts true so the first paint shows skeletons
   instead of flashing an empty state.
========================================================== */

const loading = ref(true);

const error = ref("");

const allContacts = ref([]);


/* =========================================================
   ERROR HELPER
========================================================== */

const extractError = (err, fallback) => {
  const data = err?.response?.data;

  return (
    data?.detail ||
    data?.message ||
    data?.error ||
    fallback
  );
};


/* =========================================================
   FETCH
   ContactController.list() accepts search / category /
   categories / sort / has_email / date_from / date_to /
   page / page_size (≤100) — there is NO favorite param.
   So we walk pages of 100 (cap 500) and filter client-side
   down to the locally starred ids.
========================================================== */

const PAGE_SIZE = 100;
const MAX_CONTACTS = 500;


const fetchAllContacts = async () => {
  const collected = [];

  let page = 1;
  let totalPages = 1;

  do {
    const response = await api.get(
      "/contacts",
      {
        params: {
          page,
          page_size: PAGE_SIZE,
          sort: "name_asc",
        },
      }
    );

    const data = response.data || {};

    const items = Array.isArray(data.items)
      ? data.items
      : [];

    totalPages = Number(data.total_pages || 1);

    collected.push(...items);

    page += 1;
  } while (
    page <= totalPages &&
    collected.length < MAX_CONTACTS
  );

  return collected.slice(0, MAX_CONTACTS);
};


const loadFavorites = async () => {
  error.value = "";

  /*
   * Nothing starred locally → no request needed,
   * the empty state renders straight away.
   */
  if (favoriteCount.value === 0) {
    allContacts.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;
  allContacts.value = [];

  try {
    allContacts.value =
      await fetchAllContacts();

  } catch (err) {
    allContacts.value = [];

    error.value = extractError(
      err,
      "Unable to load your favorites. Please try again."
    );

  } finally {
    loading.value = false;
  }
};


onMounted(loadFavorites);


/* =========================================================
   DERIVED — local ids decide which contacts are shown
========================================================== */

const favoriteContacts = computed(() => {
  const ids = favorites.value;

  return allContacts.value
    .filter((contact) => {
      return ids.includes(Number(contact.id));
    })
    .sort((a, b) => {
      return String(a.name).localeCompare(
        String(b.name)
      );
    });
});


/* =========================================================
   STAR TOGGLE — local list updates reactively via the ref
========================================================== */

const toggleStar = (contact) => {
  const nowFavorite = toggleFavorite(contact.id);

  if (nowFavorite) {
    toast(
      "info",
      "Added back to favorites",
      contact.name
    );

    return;
  }

  toast(
    "info",
    "Removed from favorites",
    contact.name
  );
};


/* =========================================================
   NAVIGATION
========================================================== */

const openContact = (id) => {
  router.push(`/contacts/${id}`);
};


/* =========================================================
   TEMPLATE HELPERS
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
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};


const categoryLabel = (category) => {
  const value = String(category || "")
    .trim()
    .toUpperCase();

  if (value === "WORK" || value === "FAMILY") {
    return value;
  }

  return "FRIEND";
};


const categoryClass = (category) => {
  return `category-${categoryLabel(category).toLowerCase()}`;
};


const phoneLink = (phone) => {
  const cleanPhone = String(phone || "")
    .replace(/[^0-9+]/g, "");

  return `tel:${cleanPhone}`;
};
</script>


<style scoped>
/* =========================================================
   HERO — starred count pill
========================================================== */

.fav-heading {
  flex-wrap: wrap;
}

.fav-count-pill {
  display: inline-flex;
  align-items: center;

  gap: 7px;
}

.fav-count-pill svg {
  width: 13px;
  height: 13px;

  flex-shrink: 0;

  color: var(--warning);
}

.fav-count-pill strong {
  color: var(--accent-text);

  font-size: 13px;
  font-weight: 850;
}


/* =========================================================
   ACCESSIBILITY — visually hidden loading status
========================================================== */

.fav-sr-only {
  position: absolute;

  width: 1px;
  height: 1px;

  margin: -1px;
  padding: 0;

  overflow: hidden;

  clip: rect(0 0 0 0);
  clip-path: inset(50%);

  white-space: nowrap;

  border: 0;
}


/* =========================================================
   GRID — collapses to one column on small screens
========================================================== */

.fav-grid {
  display: grid;

  grid-template-columns:
    repeat(auto-fill, minmax(240px, 1fr));

  gap: 16px;
}


/* =========================================================
   SKELETON TILE
========================================================== */

.fav-skeleton {
  flex-direction: column;

  align-items: flex-start;

  min-height: 178px;

  padding: 20px;

  border: 1px solid var(--border);
  border-radius: 18px;

  background: var(--bg-glass);
}

.fav-skeleton .skeleton-lines {
  width: 100%;
}


/* =========================================================
   FAVORITE CARD
========================================================== */

.fav-card {
  position: relative;

  display: flex;
  flex-direction: column;

  gap: 13px;

  min-width: 0;
  padding: 20px;

  border: 1px solid var(--border);
  border-radius: 18px;

  background: var(--bg-glass);

  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);

  box-shadow:
    0 10px 30px rgba(var(--shadow-rgb), 0.06);

  cursor: pointer;

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.fav-card:hover {
  transform: translateY(-2px);

  border-color: var(--accent-border);

  box-shadow:
    0 16px 38px rgba(var(--shadow-rgb), 0.1);
}


/* ---------- card head: avatar + name + chip ---------- */

.fav-card-head {
  display: flex;
  align-items: center;

  gap: 12px;

  min-width: 0;

  /* room for the star button */
  padding-right: 34px;
}

.fav-avatar {
  width: 46px;
  height: 46px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border: 1px solid var(--accent-border);
  border-radius: 14px;

  background:
    linear-gradient(
      135deg,
      var(--accent-soft),
      var(--accent-soft-hover)
    );

  color: var(--accent-text);

  font-size: 13px;
  font-weight: 850;
}

.fav-identity {
  display: flex;
  flex-direction: column;

  gap: 6px;

  min-width: 0;
}

.fav-name-link {
  display: block;

  min-width: 0;
}

.fav-name {
  display: block;

  color: var(--text-primary);

  font-size: 15px;
  font-weight: 800;

  letter-spacing: -0.1px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  transition: color 0.18s ease;
}

.fav-name-link:hover .fav-name {
  color: var(--text-link);
}

.fav-identity .contact-category {
  margin-bottom: 0;
}


/* ---------- star button ---------- */

.fav-star {
  position: absolute;
  top: 14px;
  right: 14px;

  width: 32px;
  height: 32px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--bg-inset);
  color: var(--text-faint);

  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.fav-star svg {
  width: 15px;
  height: 15px;
}

.fav-star.is-starred {
  border-color: var(--warning-border);

  background: var(--warning-soft);

  color: var(--warning);
}

.fav-star:hover {
  transform: translateY(-1px);

  border-color: var(--warning-border);
  background: var(--warning-soft);

  color: var(--warning);
}


/* ---------- phone / email lines ---------- */

.fav-line {
  display: flex;
  align-items: center;

  gap: 8px;

  min-width: 0;
}

.fav-line svg {
  width: 14px;
  height: 14px;

  flex-shrink: 0;

  color: var(--text-faint);
}

.fav-line span {
  min-width: 0;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fav-phone {
  color: var(--text-secondary);

  font-size: 12.5px;
  font-weight: 650;

  transition: color 0.18s ease;
}

.fav-email {
  color: var(--text-muted);

  font-size: 11.5px;

  transition: color 0.18s ease;
}

.fav-email.is-missing {
  color: var(--text-faint);
}

a.fav-phone:hover,
a.fav-email:hover {
  color: var(--text-link);
}

a.fav-phone:hover span,
a.fav-email:hover span {
  text-decoration: underline;
}


/* ---------- empty-state icon ---------- */

.fav-empty-icon svg {
  width: 24px;
  height: 24px;
}


/* =========================================================
   CARD ENTER / LEAVE — unfavorite animates out
========================================================== */

.fav-pop-enter-active,
.fav-pop-leave-active,
.fav-pop-move {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.fav-pop-enter-from,
.fav-pop-leave-to {
  opacity: 0;

  transform: scale(0.96);
}


/* =========================================================
   RESPONSIVE — single column below ~720px
========================================================== */

@media (max-width: 720px) {
  .fav-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .fav-heading {
    gap: 14px;
  }
}
</style>
