import {
  describe,
  it,
  expect,
  vi,
} from "vitest";

import {
  mount,
} from "@vue/test-utils";

import ContactCard from "../ContactCard.vue";


vi.mock(
  "../../services/api",
  () => ({
    default: {
      delete: vi.fn(),
    },
  })
);


const contact = {
  id: 1,
  name: "Sohan Kumar",
  phone_number: "+919876543210",
  email: "sohan@example.com",
  address: "Mumbai, India",
  category: "WORK",
};


describe(
  "ContactCard",
  () => {

    it(
      "renders contact information",
      () => {

        const wrapper = mount(
          ContactCard,
          {
            props: {
              contact,
            },

            global: {
              stubs: {
                RouterLink: true,
              },
            },
          }
        );

        expect(
          wrapper.text()
        ).toContain(
          "Sohan Kumar"
        );

        expect(
          wrapper.text()
        ).toContain(
          "+919876543210"
        );

        expect(
          wrapper.text()
        ).toContain(
          "sohan@example.com"
        );

        expect(
          wrapper.text()
        ).toContain(
          "Mumbai, India"
        );
      }
    );


    it(
      "generates correct initials",
      () => {

        const wrapper = mount(
          ContactCard,
          {
            props: {
              contact,
            },

            global: {
              stubs: {
                RouterLink: true,
              },
            },
          }
        );

        expect(
          wrapper.find(
            ".large-avatar"
          ).text()
        ).toBe("SK");
      }
    );


    it(
      "uses the same clear labels as the table columns",

      () => {

        const wrapper = mount(
          ContactCard,
          {
            props: {
              contact,
            },

            global: {
              stubs: {
                RouterLink: true,
              },
            },
          }
        );


        /*
         * Name (header) + Phone Number,
         * Email Address, Category, Address.
         */
        const labels =
          wrapper
            .findAll(".field-label")
            .map((label) => label.text());


        expect(labels).toEqual([
          "Name",
          "Phone Number",
          "Email Address",
          "Category",
          "Address",
        ]);


        /*
         * Values sit inside their labelled field.
         */
        const fields =
          wrapper.findAll(".contact-field");


        expect(fields).toHaveLength(4);


        expect(
          fields[0].text()
        ).toContain("+919876543210");


        expect(
          fields[1].text()
        ).toContain("sohan@example.com");


        expect(
          fields[2].text()
        ).toContain("WORK");


        expect(
          fields[3].text()
        ).toContain("Mumbai, India");
      }
    );

  }
);