import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
} from "vitest";

import {
  setActivePinia,
  createPinia,
} from "pinia";

import {
  useContactStore,
} from "../contactStore";

import api from "../../services/api";


vi.mock(
  "../../services/api",
  () => ({
    default: {
      get: vi.fn(),
      delete: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
    },
  })
);


describe(
  "Contact Store",
  () => {

    beforeEach(() => {
      setActivePinia(
        createPinia()
      );

      vi.clearAllMocks();
    });


    it(
      "loads three contacts per page",
      async () => {

        api.get.mockResolvedValue({
          data: {
            items: [
              {
                id: 1,
                name: "Sohan",
              },
              {
                id: 2,
                name: "Ankit",
              },
              {
                id: 3,
                name: "Neha",
              },
            ],
            total: 10,
            page: 1,
            page_size: 3,
            total_pages: 4,
          },
        });


        const store =
          useContactStore();


        await store.loadContacts();


        expect(
          store.contacts
        ).toHaveLength(3);


        expect(
          store.pageSize
        ).toBe(3);


        expect(
          store.totalPages
        ).toBe(4);


        expect(
          api.get
        ).toHaveBeenCalledWith(
          "/contacts",
          {
            params: {
              page: 1,
              page_size: 3,
            },
          }
        );
      }
    );


    it(
      "searches contacts",
      async () => {

        api.get.mockResolvedValue({
          data: {
            items: [
              {
                id: 1,
                name: "Sohan",
              },
            ],
            total: 1,
            page: 1,
            page_size: 3,
            total_pages: 1,
          },
        });


        const store =
          useContactStore();


        await store.searchContacts(
          "sohan"
        );


        expect(
          store.search
        ).toBe("sohan");


        expect(
          store.currentPage
        ).toBe(1);


        expect(
          store.contacts
        ).toHaveLength(1);
      }
    );

  }
);