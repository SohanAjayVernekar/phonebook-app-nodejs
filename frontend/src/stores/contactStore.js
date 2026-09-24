import { defineStore } from "pinia";
import api from "../services/api";

export const useContactStore = defineStore(
  "contacts",
  {
    state: () => ({
      contacts: [],
      totalContacts: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: 3,
      search: "",
      loading: false,
      error: "",
    }),

    getters: {
      firstDisplayedContact: (state) => {
        if (state.totalContacts === 0) {
          return 0;
        }

        return (
          (state.currentPage - 1) *
            state.pageSize +
          1
        );
      },

      lastDisplayedContact: (state) => {
        return Math.min(
          state.currentPage *
            state.pageSize,
          state.totalContacts
        );
      },
    },

    actions: {
      async loadContacts() {
        this.loading = true;
        this.error = "";

        try {
          const params = {
            page: this.currentPage,
            page_size: this.pageSize,
          };

          if (this.search) {
            params.search = this.search;
          }

          const response = await api.get(
            "/contacts",
            { params }
          );

          this.contacts =
            response.data.items || [];

          this.totalContacts = Number(
            response.data.total || 0
          );

          this.totalPages = Number(
            response.data.total_pages || 1
          );

          if (
            this.currentPage >
            this.totalPages
          ) {
            this.currentPage =
              this.totalPages;

            return await this.loadContacts();
          }
        } catch (error) {
          console.error(
            "Failed to load contacts:",
            error
          );

          this.error =
            "Unable to load contacts.";
        } finally {
          this.loading = false;
        }
      },

      async searchContacts(value) {
        this.search = value.trim();
        this.currentPage = 1;

        await this.loadContacts();
      },

      async clearSearch() {
        this.search = "";
        this.currentPage = 1;

        await this.loadContacts();
      },

      async goToPage(page) {
        if (
          page < 1 ||
          page > this.totalPages
        ) {
          return;
        }

        this.currentPage = page;

        await this.loadContacts();
      },

      async deleteContact(id) {
        await api.delete(
          `/contacts/${id}`
        );

        await this.loadContacts();
      },

      async createContact(contact) {
        const response =
          await api.post(
            "/contacts",
            contact
          );

        await this.loadContacts();

        return response.data;
      },

      async updateContact(
        id,
        contact
      ) {
        const response =
          await api.put(
            `/contacts/${id}`,
            contact
          );

        await this.loadContacts();

        return response.data;
      },
    },
  }
);