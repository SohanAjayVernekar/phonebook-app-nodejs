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

import ContactList from "../ContactList.vue";

import api from "../../services/api";


const contact = {
  id: 1,
  name: "Sohan Kumar",
  phone_number: "+919876543210",
  email: "sohan@example.com",
  address: "Mumbai, India",
  category: "WORK",
  created_at: "2026-09-20T10:00:00.000Z",
};


vi.mock(
  "../../services/api",
  () => ({
    default: {
      get: vi.fn(() =>
        Promise.resolve({
          data: {
            items: [contact],
            total: 1,
            total_pages: 1,
          },
        })
      ),

      post: vi.fn(),
      delete: vi.fn(),
    },
  })
);


describe(
  "ContactList (table view)",
  () => {

    beforeEach(() => {
      localStorage.setItem(
        "contacts_view_mode",
        "list"
      );
    });


    it(
      "renders a table with aligned columns",

      async () => {

        const wrapper = mount(
          ContactList,
          {
            global: {
              stubs: {
                RouterLink: true,
              },
            },
          }
        );


        await flushPromises();


        /*
         * Every column header is present.
         */
        const headers =
          wrapper
            .findAll("thead th")
            .map((th) => th.text());


        expect(headers).toEqual([
          "",
          "Name",
          "Phone Number",
          "Email Address",
          "Category",
          "Added",
          "Favorite",
          "Actions",
        ]);


        /*
         * One row, with the phone number in
         * the second data column.
         */
        const row =
          wrapper.find(
            "tbody tr.contact-table-row"
          );

        expect(row.exists()).toBe(true);


        const cells =
          row.findAll("td");


        expect(cells).toHaveLength(8);


        expect(
          cells[1].text()
        ).toContain("Sohan Kumar");


        expect(
          cells[2].text()
        ).toBe("+919876543210");


        expect(
          cells[3].text()
        ).toContain("sohan@example.com");


        expect(
          cells[4].text()
        ).toContain("WORK");


        expect(
          cells[5].text()
        ).toContain("2026");


        expect(
          cells[6]
            .find("button.star-action")
            .exists()
        ).toBe(true);
      }
    );


    it(
      "shows a placeholder when optional fields are empty",

      async () => {

        api.get.mockResolvedValueOnce({
          data: {
            items: [
              {
                ...contact,
                email: "",
                address: "",
                created_at: "",
              },
            ],

            total: 1,
            total_pages: 1,
          },
        });


        const wrapper = mount(
          ContactList,
          {
            global: {
              stubs: {
                RouterLink: true,
              },
            },
          }
        );


        await flushPromises();


        const cells =
          wrapper
            .find(
              "tbody tr.contact-table-row"
            )
            .findAll("td");


        /*
         * No email / address → em dash,
         * the cells stay aligned.
         */
        expect(
          cells[3].text()
        ).toBe("—");


        expect(
          cells[5].text()
        ).toBe("—");
      }
    );

  }
);
