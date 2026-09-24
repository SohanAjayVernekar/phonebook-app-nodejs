import {
  describe,
  it,
  expect,
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

import Settings from "../Settings.vue";


const mountSettings = async () => {
  const wrapper = mount(
    Settings,
    {
      global: {
        plugins: [
          createPinia(),
        ],
      },
    }
  );


  await flushPromises();

  return wrapper;
};


describe(
  "Settings",

  () => {

    beforeEach(() => {
      localStorage.clear();

      document.documentElement.removeAttribute(
        "data-theme"
      );
    });


    afterEach(() => {
      localStorage.clear();

      document.documentElement.removeAttribute(
        "data-theme"
      );
    });


    it(
      "renders the settings heading",

      async () => {
        const wrapper = await mountSettings();


        expect(
          wrapper.find("h1").text()
        ).toBe("Settings");


        expect(
          wrapper.find(
            ".settings-card .settings-card-title h2"
          ).exists()
        ).toBe(true);
      }
    );


    it(
      "stores preference changes on the device",

      async () => {
        localStorage.setItem(
          "contacts_view_mode",
          "grid"
        );

        localStorage.setItem(
          "contacts_density",
          "comfortable"
        );


        const wrapper = await mountSettings();


        const buttons =
          wrapper.findAll(".segmented button");


        const table =
          buttons.find((b) =>
            b.text().includes("Table")
          );

        const compact =
          buttons.find((b) =>
            b.text().includes("Compact")
          );


        await table.trigger("click");
        await compact.trigger("click");


        expect(
          localStorage.getItem(
            "contacts_view_mode"
          )
        ).toBe("list");


        expect(
          localStorage.getItem(
            "contacts_density"
          )
        ).toBe("compact");


        expect(
          table.classes()
        ).toContain("active");
      }
    );


    it(
      "switches the theme from the appearance card",

      async () => {
        const wrapper = await mountSettings();


        const buttons =
          wrapper.findAll(".segmented button");


        const dark =
          buttons.find((b) =>
            b.text() === "Dark"
          );

        const light =
          buttons.find((b) =>
            b.text() === "Light"
          );


        await dark.trigger("click");


        expect(
          localStorage.getItem("pb.theme")
        ).toBe("dark");

        expect(
          document.documentElement.dataset.theme
        ).toBe("dark");

        expect(
          dark.classes()
        ).toContain("active");


        await light.trigger("click");


        expect(
          localStorage.getItem("pb.theme")
        ).toBe("light");

        expect(
          document.documentElement.dataset.theme
        ).toBe("light");
      }
    );

  }
);
