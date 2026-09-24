import {
  describe,
  it,
  expect,
} from "vitest";

import {
  mount,
} from "@vue/test-utils";

import UiDropdown from "../UiDropdown.vue";


const OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];


const mountDropdown = (props = {}) =>
  mount(UiDropdown, {
    props: {
      modelValue: "newest",
      options: OPTIONS,
      label: "Sort contacts",
      ...props,
    },

    attachTo: document.body,
  });


describe("UiDropdown", () => {
  it("shows the current option label on the trigger", () => {
    const wrapper = mountDropdown();

    expect(
      wrapper.find(".ui-dropdown-value").text()
    ).toBe("Newest first");

    wrapper.unmount();
  });


  it("opens a floating menu and emits on pick", async () => {
    const wrapper = mountDropdown();

    await wrapper
      .find(".ui-dropdown-trigger")
      .trigger("click");

    const menu = wrapper.find(".ui-dropdown-menu");

    expect(menu.exists()).toBe(true);

    expect(
      menu.findAll(".ui-dropdown-option")
    ).toHaveLength(2);


    await menu
      .findAll(".ui-dropdown-option")[1]
      .trigger("click");


    expect(
      wrapper.emitted("update:modelValue")
    ).toEqual([["oldest"]]);

    expect(wrapper.emitted("change")).toEqual([
      ["oldest"],
    ]);


    /* menu closes after picking */
    expect(
      wrapper.find(".ui-dropdown-menu").exists()
    ).toBe(false);

    wrapper.unmount();
  });


  it("does not emit when picking the already-selected option", async () => {
    const wrapper = mountDropdown();

    await wrapper
      .find(".ui-dropdown-trigger")
      .trigger("click");

    await wrapper
      .find(".ui-dropdown-menu .ui-dropdown-option")
      .trigger("click");


    expect(
      wrapper.emitted("update:modelValue")
    ).toBeUndefined();

    expect(wrapper.emitted("change")).toBeUndefined();

    wrapper.unmount();
  });


  it("closes on Escape", async () => {
    const wrapper = mountDropdown();

    await wrapper
      .find(".ui-dropdown-trigger")
      .trigger("click");

    expect(
      wrapper.find(".ui-dropdown-menu").exists()
    ).toBe(true);

    await wrapper
      .find(".ui-dropdown-menu")
      .trigger("keydown", { key: "Escape" });

    expect(
      wrapper.find(".ui-dropdown-menu").exists()
    ).toBe(false);

    wrapper.unmount();
  });
});
