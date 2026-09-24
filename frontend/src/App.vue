<template>
  <!-- =====================================================
       COVER / AUTH PAGES (Home stays dark by design;
       Login & Register are token-driven via theme.css)
  ====================================================== -->

  <div
    v-if="isLandingPage"
    class="landing-wrapper"
  >
    <router-view />
  </div>


  <!-- =====================================================
       APPLICATION SHELL
  ====================================================== -->

  <div
    v-else
    class="app-shell"
  >

    <!-- =================================================
         TOPBAR — full width, above the sidebar
    ================================================== -->

    <header class="topbar">

      <!-- Mobile drawer trigger -->
      <button
        type="button"
        class="mobile-menu"
        aria-label="Open menu"
        @click="ui.openDrawer()"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path :d="ICONS.menu" />
        </svg>
      </button>


      <!-- Brand -->
      <router-link
        to="/dashboard"
        class="topbar-brand"
        aria-label="Phonebook App home"
      >
        <span class="topbar-logo">
          <svg
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

        <span class="topbar-brand-text">
          <strong>Phonebook App</strong>
          <span>Contact Manager</span>
        </span>
      </router-link>


      <!-- Global search (desktop) -->
      <div class="topbar-search">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="ICONS.search" />
        </svg>

        <input
          ref="topbarSearchRef"
          v-model="globalSearch"
          type="search"
          autocomplete="off"
          placeholder="Search contacts, categories, or anything..."
          aria-label="Search contacts"
          @keydown.enter="submitGlobalSearch"
          @keydown.esc="globalSearch = ''"
        />

        <kbd
          class="topbar-kbd"
          aria-hidden="true"
        >
          ⌘K
        </kbd>
      </div>


      <!-- Theme toggle -->
      <button
        type="button"
        class="icon-button topbar-theme"
        :aria-label="
          ui.isDark
            ? 'Switch to light mode'
            : 'Switch to dark mode'
        "
        :title="
          ui.isDark
            ? 'Light mode'
            : 'Dark mode'
        "
        @click="ui.toggleTheme()"
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
            :d="ui.isDark ? ICONS.sun : ICONS.moon"
          />
        </svg>
      </button>



      <!-- Add Contact -->
      <router-link
        to="/contacts/new"
        class="topbar-action"
        aria-label="Add Contact"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path :d="ICONS.plus" />
        </svg>

        <span class="topbar-action-label">
          Add Contact
        </span>
      </router-link>


      <!-- Profile menu -->
      <div
        ref="userWrapRef"
        class="topbar-menu-wrap"
      >
        <button
          type="button"
          class="topbar-user"
          :aria-expanded="userMenuOpen"
          aria-haspopup="menu"
          aria-label="Account menu"
          @click="userMenuOpen = !userMenuOpen"
        >
          <span class="user-avatar topbar-avatar">
            {{ userInitials }}
          </span>

          <span class="topbar-user-meta">
            <strong>{{ currentUserName }}</strong>
            <span>{{ currentUserEmail }}</span>
          </span>

          <svg
            class="topbar-user-chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path :d="CHEV_DOWN_ICON" />
          </svg>
        </button>

        <transition name="topbar-menu-pop">
          <div
            v-if="userMenuOpen"
            class="topbar-menu user-menu"
            role="menu"
            aria-label="Account"
          >
            <div class="topbar-menu-head">
              <span class="user-avatar">
                {{ userInitials }}
              </span>

              <div class="topbar-menu-identity">
                <strong>{{ currentUserName }}</strong>
                <span>{{ currentUserEmail }}</span>
              </div>
            </div>

            <router-link
              to="/profile"
              role="menuitem"
              @click="userMenuOpen = false"
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
                <path :d="ICONS.profile" />
              </svg>
              <span class="menu-text">
                <span>Profile</span>
                <small>View your profile</small>
              </span>

              <svg
                class="menu-go"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path :d="ICONS.chevronRight" />
              </svg>
            </router-link>

            <router-link
              to="/settings"
              role="menuitem"
              @click="userMenuOpen = false"
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
                <path :d="ICONS.settings" />
              </svg>
              <span class="menu-text">
                <span>Settings</span>
                <small>Customize your experience</small>
              </span>

              <svg
                class="menu-go"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path :d="ICONS.chevronRight" />
              </svg>
            </router-link>

            <button
              type="button"
              role="menuitem"
              class="topbar-menu-logout"
              @click="logout"
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
                <path :d="ICONS.logout" />
              </svg>
              <span class="menu-text">
                <span>Log out</span>
                <small>Sign out of your account</small>
              </span>
            </button>
          </div>
        </transition>
      </div>

    </header>


    <!-- =================================================
         BODY — sidebar + main content
    ================================================== -->

    <div class="app-body">

      <!-- Mobile drawer overlay -->
      <div
        v-if="ui.drawerOpen"
        class="sidebar-overlay"
        @click="ui.closeDrawer()"
      ></div>


      <!-- =============================================
           SIDEBAR
      ============================================== -->

      <aside
        ref="sidebarRef"
        class="sidebar"
        :class="sidebarClasses"
        :style="sidebarStyle"
        aria-label="Sidebar"
        @pointerenter="onSidebarEnter"
        @pointerleave="onSidebarLeave"
      >

        <!-- Header: collapse toggle + mobile close -->
        <div class="sidebar-header sidebar-header-slim">


          <!-- Mobile close -->
          <button
            type="button"
            class="mobile-close"
            aria-label="Close menu"
            @click="ui.closeDrawer()"
          >
            ×
          </button>

        </div>


        <!-- Navigation (drag to reorder — persisted) -->
        <nav
          ref="navRef"
          class="sidebar-nav"
          aria-label="Main navigation"
        >
          <template
            v-for="section in NAV_SECTIONS"
            :key="section.id"
          >
            <span class="nav-section">
              {{ section.label }}
            </span>

            <router-link
              v-for="entry in sectionEntries(section)"
              :key="entry.item.id"
              :to="entry.item.to"
              class="nav-item"
              :class="navItemClass(entry.index)"
              :draggable="isDesktop"
              :data-tip="entry.item.label"
              @click="onNavClick"
              @mouseenter="onTipEnter"
              @mouseleave="onTipLeave"
              @dragstart="onDragStart(entry.index, $event)"
              @dragover="onDragOver(entry.index, $event)"
              @dragend="onDragEnd"
              @drop="onDrop(entry.index, $event)"
            >

              <span class="nav-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path :d="ICONS[entry.item.icon]" />
                </svg>
              </span>

              <span class="nav-label">
                {{ entry.item.label }}
              </span>

              <span
                v-if="entry.item.badge === 'favorites'"
                class="nav-badge"
              >
                {{ favoriteCount }}
              </span>

            </router-link>
          </template>

          <span
            ref="sliderRef"
            class="nav-slider"
            aria-hidden="true"
          ></span>
        </nav>


        <!-- Resize handle (desktop) -->
        <button
          type="button"
          class="sidebar-resize"
          aria-label="Resize sidebar"
          @pointerdown="startResize"
          @keydown="onResizeKey"
        ></button>
      </aside>


      <!-- =============================================
           MAIN CONTENT
      ============================================== -->

      <main class="main-content">

        <div class="page-container">

          <router-view v-slot="{ Component, route: viewRoute }">

            <transition name="page" mode="out-in">

              <component
                :is="Component"
                :key="viewRoute.path"
              />

            </transition>

          </router-view>

        </div>

      </main>

    </div>


    <!-- =================================================
         COLLAPSED-SIDEBAR TOOLTIP (JS-positioned)
    ================================================== -->

    <div
      class="sidebar-tooltip"
      :class="{ 'is-visible': tooltip.visible }"
      :style="{
        top: tooltip.top + 'px',
        left: tooltip.left + 'px',
      }"
      role="tooltip"
    >
      {{ tooltip.text }}
    </div>


    <!-- =================================================
         TOASTS
    ================================================== -->

    <transition-group
      name="toast"
      tag="div"
      class="toast-stack"
      aria-live="polite"
    >

      <div
        v-for="t in ui.toasts"
        :key="t.id"
        class="toast"
        :class="'toast-' + t.type"
        role="status"
      >

        <span class="toast-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path :d="ICONS[TOAST_ICON[t.type] || 'info']" />
          </svg>
        </span>

        <div class="toast-body">
          <strong
            v-if="t.title"
            class="toast-title"
          >
            {{ t.title }}
          </strong>

          <span
            v-if="t.message"
            class="toast-message"
          >
            {{ t.message }}
          </span>
        </div>

        <button
          type="button"
          class="toast-close"
          aria-label="Dismiss notification"
          @click="ui.dismissToast(t.id)"
        >
          ×
        </button>

      </div>

    </transition-group>


    <!-- =================================================
         CONFIRM MODAL
    ================================================== -->

    <transition name="modal-overlay">

      <div
        v-if="ui.confirmState.open"
        class="modal-overlay"
        @click.self="ui.settleConfirm(false)"
      >

        <div
          class="modal"
          role="alertdialog"
          aria-modal="true"
          :aria-label="ui.confirmState.title"
        >

          <div class="modal-title">

            <span
              class="modal-title-icon"
              :class="{
                'is-accent': !ui.confirmState.danger,
              }"
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
                  :d="
                    ui.confirmState.danger
                      ? ICONS.alertTriangle
                      : ICONS.helpCircle
                  "
                />
              </svg>
            </span>

            <h3>{{ ui.confirmState.title }}</h3>

          </div>

          <p
            v-if="ui.confirmState.message"
            class="modal-body"
          >
            {{ ui.confirmState.message }}
          </p>

          <div class="modal-actions">

            <button
              type="button"
              class="modal-button"
              @click="ui.settleConfirm(false)"
            >
              {{ ui.confirmState.cancelText }}
            </button>

            <button
              type="button"
              class="modal-button is-confirm"
              :class="{
                'is-danger': ui.confirmState.danger,
              }"
              @click="ui.settleConfirm(true)"
            >
              {{ ui.confirmState.confirmText }}
            </button>

          </div>

        </div>

      </div>

    </transition>

  </div>
</template>


<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";

import {
  useRoute,
  useRouter,
} from "vue-router";

import {
  useAuthStore,
} from "./stores/authStore";

import {
  MAX_WIDTH,
  MIN_WIDTH,
  useUiStore,
} from "./stores/uiStore";

import {
  useFavorites,
} from "./composables/useFavorites";

import {
  registerConfirm,
  registerToast,
} from "./services/ui";

import {
  ICONS,
  TOAST_ICON,
} from "./icons";


/* =========================================================
   STORES / ROUTER
========================================================= */

const route = useRoute();

const router = useRouter();

const authStore = useAuthStore();

const ui = useUiStore();

const { favoriteCount } = useFavorites();


/* =========================================================
   NAVIGATION ITEMS
   order is persisted via uiStore (pb.sidebar.order)
========================================================= */

const NAV_ITEMS = [
  {
    id: "dashboard",
    to: "/dashboard",
    label: "Dashboard",
    icon: "dashboard",
  },
  {
    id: "contacts",
    to: "/contacts",
    label: "Contacts",
    icon: "contacts",
  },
  {
    id: "add",
    to: "/contacts/new",
    label: "Add Contact",
    icon: "add",
  },
  {
    id: "favorites",
    to: "/favorites",
    label: "Favorites",
    icon: "favorites",
    badge: "favorites",
  },
  {
    id: "categories",
    to: "/categories",
    label: "Categories",
    icon: "categories",
  },
  {
    id: "profile",
    to: "/profile",
    label: "Profile",
    icon: "profile",
  },
  {
    id: "settings",
    to: "/settings",
    label: "Settings",
    icon: "settings",
  },
];


const NAV_SECTIONS = [
  {
    id: "overview",
    label: "OVERVIEW",
    items: [
      "dashboard",
      "contacts",
      "favorites",
      "categories",
    ],
  },
  {
    id: "manage",
    label: "MANAGE",
    items: ["add"],
  },
  {
    id: "account",
    label: "ACCOUNT",
    items: ["profile", "settings"],
  },
];


const sectionEntries = (section) => {
  const entries = [];

  orderedNav.value.forEach((item, index) => {
    if (section.items.includes(item.id)) {
      entries.push({ item, index });
    }
  });

  return entries;
};


const orderedNav = computed(() => {

  const byId = new Map(
    NAV_ITEMS.map((item) => [item.id, item]),
  );

  const ordered = [];


  ui.navOrder.forEach((id) => {
    if (byId.has(id)) {
      ordered.push(byId.get(id));

      byId.delete(id);
    }
  });


  /* new items (or a cleared order) fall back to default */
  NAV_ITEMS.forEach((item) => {
    if (byId.has(item.id)) {
      ordered.push(byId.get(item.id));
    }
  });


  return ordered;
});


const isNavActive = (item) => {

  const path = route.path;


  if (item.id === "add") {
    return path === "/contacts/new";
  }


  if (item.id === "contacts") {
    return (
      path.startsWith("/contacts") &&
      path !== "/contacts/new"
    );
  }


  if (item.id === "profile") {
    return path === "/profile";
  }


  return (
    path === item.to ||
    path.startsWith(item.to + "/")
  );
};


/* =========================================================
   LANDING / AUTH WRAPPER
========================================================= */

const isLandingPage = computed(() => {
  return ["home", "login", "register"].includes(
    route.name,
  );
});




/* =========================================================
   CURRENT USER
========================================================= */

const currentUserName = computed(() => {
  return authStore.user?.name || "User";
});


const currentUserEmail = computed(() => {
  return authStore.user?.email || "Signed-in user";
});


const userInitials = computed(() => {
  const parts = currentUserName.value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "U";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
});


/* =========================================================
   LOGOUT
========================================================= */

const logout = () => {
  authStore.logout();

  router.push({ name: "login" });
};


/* =========================================================
   VIEWPORT (desktop drawer vs desktop sidebar)
========================================================= */

const isDesktop = ref(true);

let viewportQuery = null;


const syncViewport = () => {
  isDesktop.value = window.innerWidth >= 960;

  if (isDesktop.value) {
    ui.closeDrawer();
  } else {
    ui.peeking = false;
  }
};


/* =========================================================
   SIDEBAR STATE
========================================================= */

const sidebarRef = ref(null);


const effectiveCollapsed = computed(() => {
  return ui.collapsed && !ui.peeking;
});


const sidebarClasses = computed(() => ({
  "is-resizing": ui.resizing,
  "drawer-open": ui.drawerOpen,
}));


const dragWidth = ref(null);


const sidebarStyle = computed(() => {
  const width = dragWidth.value ?? ui.width;

  return {
    "--sidebar-width": `${width}px`,

    ...(dragWidth.value != null
      ? { width: `${dragWidth.value}px` }
      : {}),
  };
});


/* ---------- tooltip (JS-positioned) ---------- */

const tooltip = reactive({
  visible: false,
  text: "",
  top: 0,
  left: 0,
});


const hideTip = () => {
  tooltip.visible = false;
};


const onTipEnter = (event) => {

  if (!isDesktop.value) return;

  if (!effectiveCollapsed.value) return;


  const text = event.currentTarget?.dataset?.tip;

  if (!text) return;


  const rect = event.currentTarget.getBoundingClientRect();

  const sideRect =
    sidebarRef.value?.getBoundingClientRect();


  tooltip.text = text;

  tooltip.top = rect.top + rect.height / 2;

  tooltip.left =
    (sideRect ? sideRect.right : 72) + 12;

  tooltip.visible = true;
};


const onTipLeave = () => {
  hideTip();
};


/* ---------- dwell peek / auto collapse ---------- */

const onSidebarEnter = () => {
  hideTip();
};


const onSidebarLeave = () => {
  hideTip();
};


/* Sliding active indicator (transform/opacity only). */
const navRef = ref(null);

const sliderRef = ref(null);


const updateSlider = () => {
  const nav = navRef.value;

  const slider = sliderRef.value;

  if (!nav || !slider) {
    return;
  }

  const active = nav.querySelector(
    ".nav-item.active",
  );

  if (!active) {
    slider.style.opacity = "0";
    return;
  }

  const navRect = nav.getBoundingClientRect();

  const rect = active.getBoundingClientRect();

  slider.style.opacity = "1";

  slider.style.transform =
    `translateY(${rect.top - navRect.top + nav.scrollTop}px)`;

  slider.style.height = `${rect.height}px`;
};


watch(
  [
    () => route.path,
    effectiveCollapsed,
    () => ui.width,
    () => ui.peeking,
    () => ui.drawerOpen,
  ],
  () => {
    nextTick(updateSlider);
  },
);


const onNavResize = () => {
  updateSlider();
};


const onNavClick = () => {
  hideTip();

  ui.closeDrawer();
};


/* ---------- resize ---------- */

let removeResizeListeners = null;


const startResize = (event) => {

  if (!isDesktop.value) return;

  event.preventDefault();

  hideTip();


  if (ui.collapsed) {
    ui.setCollapsed(false);
  }


  const startX = event.clientX;

  const startW = ui.width;

  ui.resizing = true;

  document.body.classList.add("is-resizing");


  const onMove = (moveEvent) => {
    const next =
      startW + (moveEvent.clientX - startX);

    dragWidth.value = Math.min(
      MAX_WIDTH,
      Math.max(MIN_WIDTH, next),
    );
  };


  const onUp = () => {
    removeResizeListeners?.();

    if (dragWidth.value != null) {
      ui.setWidth(dragWidth.value);
    }

    dragWidth.value = null;

    ui.resizing = false;
  };


  window.addEventListener("pointermove", onMove);

  window.addEventListener("pointerup", onUp);


  removeResizeListeners = () => {
    window.removeEventListener("pointermove", onMove);

    window.removeEventListener("pointerup", onUp);

    document.body.classList.remove("is-resizing");

    removeResizeListeners = null;
  };
};


/* keyboard resize (accessibility) */
const onResizeKey = (event) => {

  if (!isDesktop.value) return;

  if (event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight") {
    return;
  }


  event.preventDefault();

  hideTip();


  const step = event.shiftKey ? 32 : 12;

  const delta =
    event.key === "ArrowLeft" ? -step : step;

  if (ui.collapsed && delta > 0) {
    ui.setCollapsed(false);
  }

  ui.setWidth(ui.width + delta);
};


/* ---------- drag & drop reorder ---------- */

const dragIndex = ref(-1);

const dropIndex = ref(-1);

const dropPosition = ref("");


const resetDrag = () => {
  dragIndex.value = -1;

  dropIndex.value = -1;

  dropPosition.value = "";
};


const navItemClass = (index) => ({
  "is-dragging": dragIndex.value === index,

  "is-drag-above":
    dropIndex.value === index &&
    dropPosition.value === "above",

  "is-drag-below":
    dropIndex.value === index &&
    dropPosition.value === "below",

  active: isNavActive(orderedNav.value[index]),
});


const onDragStart = (index, event) => {
  dragIndex.value = index;

  event.dataTransfer.effectAllowed = "move";

  event.dataTransfer.setData(
    "text/plain",
    String(index),
  );
};


const onDragOver = (index, event) => {

  if (dragIndex.value < 0) return;

  event.preventDefault();

  event.dataTransfer.dropEffect = "move";

  dropIndex.value = index;

  const rect =
    event.currentTarget.getBoundingClientRect();

  dropPosition.value =
    event.clientY < rect.top + rect.height / 2
      ? "above"
      : "below";
};


const onDrop = (index, event) => {

  event.preventDefault();


  const from = dragIndex.value;


  if (from >= 0 && from !== index) {

    const ids = orderedNav.value.map(
      (item) => item.id,
    );

    const [moved] = ids.splice(from, 1);

    let target = index;

    if (from < index) target -= 1;

    if (dropPosition.value === "below") {
      target += 1;
    }

    target = Math.min(
      ids.length,
      Math.max(0, target),
    );

    ids.splice(target, 0, moved);

    ui.saveNavOrder(ids);
  }


  resetDrag();
};


const onDragEnd = () => {
  resetDrag();
};


/* =========================================================
   TOAST / CONFIRM BRIDGE
   registered so components can call the plain-module
   helpers in src/services/ui.js
========================================================= */

registerToast((payload) => ui.pushToast(payload));

registerConfirm((options) => ui.askConfirm(options));


watch(
  () => ui.confirmState.open,
  (open) => {
    if (open) {
      window.addEventListener(
        "keydown",
        onConfirmKey,
      );
    } else {
      window.removeEventListener(
        "keydown",
        onConfirmKey,
      );
    }
  },
);


const onConfirmKey = (event) => {
  if (event.key === "Escape") {
    ui.settleConfirm(false);
  }
};

/* =========================================================
   LIFECYCLE
========================================================= */

/* Topbar global search + profile menu.
   Search deep-links to /contacts?q=, menu closes on
   navigation, Escape, or outside pointer. */
const CHEV_DOWN_ICON = "m6 9 6 6 6-6";

const globalSearch = ref("");

const userMenuOpen = ref(false);

const userWrapRef = ref(null);

const topbarSearchRef = ref(null);


const closeTopbarMenus = () => {
  userMenuOpen.value = false;
};


const submitGlobalSearch = () => {
  const term = globalSearch.value.trim();

  if (!term) {
    return;
  }

  closeTopbarMenus();

  router.push({
    path: "/contacts",
    query: {
      ...route.query,
      q: term,
    },
  });
};


const onTopbarPointerDown = (event) => {
  if (!userWrapRef.value?.contains(event.target)) {
    userMenuOpen.value = false;
  }
};


const onTopbarKey = (event) => {
  if (event.key === "Escape") {
    closeTopbarMenus();
  }
};


const onGlobalShortcut = (event) => {
  const modifier = event.metaKey || event.ctrlKey;

  if (
    modifier &&
    event.key.toLowerCase() === "k"
  ) {
    event.preventDefault();

    closeTopbarMenus();

    topbarSearchRef.value?.focus();
    topbarSearchRef.value?.select();
  }
};


watch(
  () => route.path,
  () => {
    closeTopbarMenus();
  },
);


onMounted(() => {

  ui.setCollapsed(false);
  ui.peeking = false;

  syncViewport();

  window.addEventListener(
    "pointerdown",
    onTopbarPointerDown,
  );

  window.addEventListener(
    "keydown",
    onTopbarKey,
  );

  window.addEventListener(
    "keydown",
    onGlobalShortcut,
  );

  window.addEventListener(
    "resize",
    onNavResize,
  );

  viewportQuery = window.matchMedia(
    "(min-width: 960px)",
  );

  viewportQuery.addEventListener?.(
    "change",
    syncViewport,
  );

  nextTick(updateSlider);
});


onBeforeUnmount(() => {

  removeResizeListeners?.();

  viewportQuery?.removeEventListener?.(
    "change",
    syncViewport,
  );

  window.removeEventListener(
    "keydown",
    onConfirmKey,
  );

  window.removeEventListener(
    "pointerdown",
    onTopbarPointerDown,
  );

  window.removeEventListener(
    "keydown",
    onTopbarKey,
  );

  window.removeEventListener(
    "keydown",
    onGlobalShortcut,
  );

  window.removeEventListener(
    "resize",
    onNavResize,
  );

  registerToast(null);

  registerConfirm(null);
});
</script>


<style>
/* Page leave (out-in needs leave classes; shell.css ships enter) */
.page-leave-active {
  transition:
    opacity 0.12s ease-in,
    transform 0.12s ease-in;
}

.page-leave-to {
  opacity: 0;

  transform: translateY(-6px);
}
</style>
