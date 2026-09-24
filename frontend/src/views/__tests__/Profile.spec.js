import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import {
  mount,
  flushPromises,
} from "@vue/test-utils";

import {
  createPinia,
} from "pinia";

import {
  createRouter,
  createMemoryHistory,
} from "vue-router";

import Profile from "../Profile.vue";

import api from "../../services/api";


const user = {
  id: 7,
  name: "Sohan Kumar",
  email: "sohan@example.com",
  google_id: null,
  created_at: "2025-03-12T10:15:00.000Z",
};


vi.mock(
  "../../services/api",
  () => ({
    default: {
      get: vi.fn(() =>
        Promise.resolve({
          data: { ...user },
        })
      ),

      post: vi.fn(),

      patch: vi.fn(() =>
        Promise.resolve({
          data: { ...user },
        })
      ),

      delete: vi.fn(),
    },
  })
);


const mountProfile = async () => {

  const router = createRouter({
    history: createMemoryHistory(),

    routes: [
      {
        path: "/",
        name: "home",
        component: { template: "<div />" },
      },

      {
        path: "/login",
        name: "login",
        component: { template: "<div />" },
      },

      {
        path: "/profile",
        name: "profile",
        component: Profile,
      },
    ],
  });


  const wrapper = mount(
    Profile,
    {
      global: {
        plugins: [
          createPinia(),
          router,
        ],

        stubs: {
          RouterLink: true,
        },
      },
    }
  );


  await flushPromises();

  return wrapper;
};


describe(
  "Profile",

  () => {

    beforeEach(() => {
      localStorage.clear();

      localStorage.setItem(
        "auth_user",
        JSON.stringify(user)
      );

      vi.clearAllMocks();
    });


    it(
      "shows the signed-in user's profile",

      async () => {
        const wrapper = await mountProfile();


        /* Fresh profile loaded from the API. */
        expect(api.get).toHaveBeenCalledWith(
          "/auth/me"
        );


        expect(
          wrapper.find(
            ".profile-hero-info h2"
          ).text()
        ).toBe("Sohan Kumar");


        expect(
          wrapper.find(
            ".profile-hero-email"
          ).text()
        ).toBe("sohan@example.com");


        /* Member since + user id. */
        expect(
          wrapper.find(
            ".profile-hero-chips"
          ).text()
        ).toContain("12 Mar 2025");


        expect(
          wrapper.find(
            ".dashboard-date strong"
          ).text()
        ).toBe("#7");
      }
    );


    it(
      "saves an updated name to the API",

      async () => {
        api.patch.mockResolvedValueOnce({
          data: {
            ...user,
            name: "Sohan K",
          },
        });


        const wrapper = await mountProfile();


        /* Save is disabled until the form changes. */
        const save =
          wrapper.find(
            ".profile-form button.save-button"
          );

        expect(
          save.attributes("disabled")
        ).toBeDefined();


        await wrapper
          .find("#profile-name")
          .setValue("Sohan K");


        expect(
          save.attributes("disabled")
        ).toBeUndefined();


        await wrapper
          .find("form.profile-form")
          .trigger("submit");

        await flushPromises();


        expect(api.patch).toHaveBeenCalledWith(
          "/auth/me",
          { name: "Sohan K" }
        );


        /* The sidebar picks the new name up too. */
        expect(
          JSON.parse(
            localStorage.getItem("auth_user")
          ).name
        ).toBe("Sohan K");


        expect(
          wrapper.find(
            ".profile-form .form-success"
          ).exists()
        ).toBe(true);
      }
    );


    it(
      "rejects a password that does not match",

      async () => {
        const wrapper = await mountProfile();


        await wrapper
          .find("#password-current")
          .setValue("old-password-1");

        await wrapper
          .find("#password-new")
          .setValue("new-password-1");

        await wrapper
          .find("#password-confirm")
          .setValue("different-password");


        await wrapper
          .find("form.password-form")
          .trigger("submit");

        await flushPromises();


        expect(
          wrapper.find(
            "form.password-form .form-error"
          ).text()
        ).toContain("match");


        expect(api.patch).not.toHaveBeenCalled();
      }
    );


  }
);
