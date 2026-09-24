import {
  computed,
  ref,
} from "vue";

import {
  defineStore,
} from "pinia";


/* =========================================================
   STORAGE HELPERS
   all persisted UI state lives under the pb.* namespace
========================================================= */

const LS = {
  theme: "pb.theme",
  collapsed: "pb.collapsed",
  width: "pb.width",
  pinned: "pb.pinned",
  order: "pb.sidebar.order",
};

export const MIN_WIDTH = 208;
export const MAX_WIDTH = 420;
const DEFAULT_WIDTH = 288;


const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};


const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode) — state stays in-memory */
  }
};


const readBool = (key, fallback) => {
  const raw = read(key);

  if (raw === "true") return true;
  if (raw === "false") return false;

  return fallback;
};


const readInt = (key, fallback) => {
  const raw = Number.parseInt(read(key) ?? "", 10);

  return Number.isFinite(raw) ? raw : fallback;
};


const clampWidth = (width) => {
  return Math.min(
    MAX_WIDTH,
    Math.max(MIN_WIDTH, width),
  );
};


/* =========================================================
   THEME
========================================================= */

const THEME_META = {
  light: "#f6f8fc",
  dark: "#0a0e14",
};


const applyTheme = (theme) => {
  const root = document.documentElement;

  root.dataset.theme = theme;

  root.style.colorScheme = theme;


  const meta = document.querySelector(
    'meta[name="theme-color"]',
  );

  if (meta) {
    meta.setAttribute(
      "content",
      THEME_META[theme] ?? THEME_META.light,
    );
  }
};


const readTheme = () => {
  const stored = read(LS.theme);

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia?.(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
};


/* =========================================================
   TOAST / CONFIRM TYPES
========================================================= */

let toastSeq = 0;


/* =========================================================
   STORE
========================================================= */

export const useUiStore = defineStore("ui", () => {

  /* -----------------------------------------------------
     Theme
  ----------------------------------------------------- */

  const theme = ref(readTheme());

  applyTheme(theme.value);


  const isDark = computed(() => {
    return theme.value === "dark";
  });


  const setTheme = (next) => {
    theme.value = next === "dark" ? "dark" : "light";

    write(LS.theme, theme.value);

    applyTheme(theme.value);
  };


  const toggleTheme = () => {
    setTheme(
      theme.value === "dark"
        ? "light"
        : "dark",
    );
  };


  /* -----------------------------------------------------
     Sidebar
  ----------------------------------------------------- */

  const collapsed = ref(
    readBool(LS.collapsed, false),
  );

  const pinned = ref(
    readBool(LS.pinned, true),
  );

  const width = ref(
    clampWidth(
      readInt(LS.width, DEFAULT_WIDTH),
    ),
  );

  /*
   * Transient states — never persisted:
   *   peeking    temporary hover expansion (collapsed + unpinned)
   *   drawerOpen mobile drawer
   *   resizing   drag in progress
   */

  const peeking = ref(false);

  const drawerOpen = ref(false);

  const resizing = ref(false);


  const setCollapsed = (value) => {
    collapsed.value = Boolean(value);

    write(
      LS.collapsed,
      String(collapsed.value),
    );
  };


  const toggleCollapsed = () => {
    peeking.value = false;

    setCollapsed(!collapsed.value);
  };


  const setPinned = (value) => {
    pinned.value = Boolean(value);

    write(LS.pinned, String(pinned.value));
  };


  const togglePinned = () => {
    setPinned(!pinned.value);
  };


  const setWidth = (value) => {
    width.value = clampWidth(
      Math.round(value),
    );

    write(LS.width, String(width.value));
  };


  const openDrawer = () => {
    drawerOpen.value = true;
  };


  const closeDrawer = () => {
    drawerOpen.value = false;

    peeking.value = false;
  };


  /* -----------------------------------------------------
     Navigation order (drag & drop, persisted)
  ----------------------------------------------------- */

  const storedOrder = (() => {
    try {
      const parsed = JSON.parse(
        read(LS.order) ?? "[]",
      );

      return Array.isArray(parsed)
        ? parsed.filter(
            (id) => typeof id === "string",
          )
        : [];
    } catch {
      return [];
    }
  })();


  const navOrder = ref(storedOrder);


  const saveNavOrder = (ids) => {
    navOrder.value = [...ids];

    write(
      LS.order,
      JSON.stringify(navOrder.value),
    );
  };


  /* -----------------------------------------------------
     Toasts
  ----------------------------------------------------- */

  const toasts = ref([]);


  const dismissToast = (id) => {
    toasts.value = toasts.value.filter(
      (toast) => toast.id !== id,
    );
  };


  const pushToast = ({
    type = "info",
    title = "",
    message = "",
    duration = 4500,
  } = {}) => {

    const id = ++toastSeq;

    toasts.value = [
      ...toasts.value,
      { id, type, title, message },
    ];


    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }


    return id;
  };


  /* -----------------------------------------------------
     Confirm modal
  ----------------------------------------------------- */

  const confirmState = ref({
    open: false,
    title: "Are you sure?",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    danger: false,
  });


  let confirmResolve = null;


  const askConfirm = (options = {}) => {

    if (confirmState.value.open && confirmResolve) {
      confirmResolve(false);
    }


    confirmState.value = {
      open: true,
      title: options.title ?? "Are you sure?",
      message: options.message ?? "",
      confirmText: options.confirmText ?? "Confirm",
      cancelText: options.cancelText ?? "Cancel",
      danger: Boolean(options.danger),
    };


    return new Promise((resolve) => {
      confirmResolve = resolve;
    });
  };


  const settleConfirm = (accepted) => {

    confirmState.value = {
      ...confirmState.value,
      open: false,
    };


    const resolve = confirmResolve;

    confirmResolve = null;

    resolve?.(accepted);
  };


  /* -----------------------------------------------------
     Export
  ----------------------------------------------------- */

  return {
    /* theme */
    theme,
    isDark,
    setTheme,
    toggleTheme,

    /* sidebar */
    collapsed,
    pinned,
    width,
    peeking,
    drawerOpen,
    resizing,
    setCollapsed,
    toggleCollapsed,
    setPinned,
    togglePinned,
    setWidth,
    openDrawer,
    closeDrawer,

    /* nav order */
    navOrder,
    saveNavOrder,

    /* toasts */
    toasts,
    pushToast,
    dismissToast,

    /* confirm */
    confirmState,
    askConfirm,
    settleConfirm,
  };

});
