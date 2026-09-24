import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

import {
  mount,
  flushPromises,
} from "@vue/test-utils";

import {
  createPinia,
} from "pinia";

import App from "../../App.vue";

import router from "../../router";

import {
  ICONS,
} from "../../icons";

import {
  useUiStore,
} from "../../stores/uiStore";


/* =========================================================
   ENVIRONMENT POLYFILLS
   jsdom ships neither matchMedia (used by App on mount)
   nor ResizeObserver.
========================================================= */

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}


/* =========================================================
   API DOUBLE
   Every view talks to the same module, so mocking it here
   covers all importers. Shapes match the real backend.
========================================================= */

const user = {
  id: 2,
  name: "Test User",
  email: "testuser@example.com",
  google_id: null,
  created_at: "2026-09-22T05:59:34.41406Z",
};

const contact = {
  id: 7,
  name: "Ada Lovelace",
  phone_number: "+14155552671",
  email: "ada@example.com",
  address: "12 St James Square",
  category: "WORK",
  created_at: "2026-09-20T10:00:00.000Z",
};

const emptyList = {
  items: [],
  total: 0,
  page: 1,
  page_size: 8,
  total_pages: 0,
  category: null,
  sort: "newest",
};


vi.mock(
  "../../services/api",
  () => {
    const dataFor = (url) => {
      if (url === "/health") {
        return {
          api: "online",
          database: "online",
        };
      }

      if (url === "/auth/me") {
        return { ...user };
      }

      if (/^\/contacts\/\d+$/.test(url)) {
        return { ...contact };
      }

      if (url === "/contacts") {
        return { ...emptyList };
      }

      return {};
    };

    const make =
      (verb) =>
      vi.fn((url) =>
        Promise.resolve({
          data: dataFor(url),
          status: 200,
          config: { method: verb },
        })
      );

    return {
      default: {
        get: make("get"),
        post: make("post"),
        patch: make("patch"),
        put: make("put"),
        delete: make("delete"),
        interceptors: {
          request: { use: () => {}, eject: () => {} },
          response: { use: () => {}, eject: () => {} },
        },
      },
    };
  }
);


/* =========================================================
   ROUTES — every page the router can resolve
========================================================= */

const ROUTES = [
  { path: "/", guest: true },
  { path: "/login", guest: true },
  { path: "/register", guest: true },
  { path: "/dashboard" },
  { path: "/contacts" },
  { path: "/contacts/new" },
  { path: "/contacts/7" },
  { path: "/favorites" },
  { path: "/categories" },
  { path: "/import" },
  { path: "/export" },
  { path: "/profile" },
  { path: "/settings" },
  { path: "/definitely-not-a-page" },
];


const mountAt = async (path, guest) => {
  localStorage.clear();

  localStorage.setItem(
    "auth_user",
    JSON.stringify(user)
  );

  if (guest) {
    localStorage.removeItem("access_token");
  } else {
    localStorage.setItem(
      "access_token",
      "test-token"
    );
  }

  await router.push(path);
  await router.isReady();

  const wrapper = mount(App, {
    global: {
      plugins: [createPinia(), router],
    },
  });

  await flushPromises();
  await flushPromises();

  return wrapper;
};


describe(
  "Every route renders in the app shell",

  () => {
    let errorSpy;
    let captured;

    beforeEach(() => {
      captured = [];

      errorSpy = vi
        .spyOn(console, "error")
        .mockImplementation((...args) => {
          captured.push(args.join(" "));
        });
    });

    afterEach(() => {
      errorSpy.mockRestore();
    });


    it.each(ROUTES)(
      "renders $path with real content",

      async ({ path, guest }) => {
        const wrapper = await mountAt(
          path,
          Boolean(guest)
        );


        /* The page itself rendered — every view has a
           heading, the App shell does not. */
        expect(
          wrapper.find("h1, h2").exists()
        ).toBe(true);


        /* Nothing failed to resolve or threw while
           rendering. */
        const failures = captured.filter((line) =>
          /Failed to resolve|Invalid vnode|is not a function|Cannot read|TypeError|Unhandled/i.test(
            line
          )
        );

        expect(failures).toEqual([]);


        wrapper.unmount();
      }
    );
  }
);


describe(
  "Shell wiring",

  () => {
    afterEach(() => {
      localStorage.clear();
      document.documentElement.removeAttribute(
        "data-theme"
      );
    });


    it(
      "sidebar navigation targets all resolve to real routes",

      () => {
        const targets = [
          "/dashboard",
          "/contacts",
          "/contacts/new",
          "/favorites",
          "/categories",
          "/import",
          "/export",
          "/profile",
          "/settings",
        ];

        const resolved = targets.map(
          (path) =>
            router.resolve(path).name
        );

        expect(resolved).not.toContain("not-found");

        resolved.forEach((name) => {
          expect(name).toBeTruthy();
        });
      }
    );


    it(
      "every nav icon name exists in the icon set",

      () => {
        const names = [
          "dashboard",
          "contacts",
          "add",
          "favorites",
          "categories",
          "import",
          "export",
          "activity",
          "profile",
          "settings",
        ];

        names.forEach((name) => {
          expect(ICONS[name]).toBeTruthy();
        });
      }
    );


    it(
      "applies and persists the dark theme",

      () => {
        const pinia = createPinia();

        const ui = useUiStore(pinia);

        ui.setTheme("dark");

        expect(
          document.documentElement.dataset.theme
        ).toBe("dark");

        expect(
          localStorage.getItem("pb.theme")
        ).toBe("dark");

        ui.setTheme("light");

        expect(
          document.documentElement.dataset.theme
        ).toBe("light");

        expect(
          localStorage.getItem("pb.theme")
        ).toBe("light");
      }
    );
  }
);
