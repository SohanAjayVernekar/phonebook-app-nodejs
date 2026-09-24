<template>
  <section class="contact-detail">

    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->

    <div class="page-header">

      <div>
        <span class="section-label">
          CONTACT DETAILS
        </span>

        <h1>
          Edit Contact
        </h1>

        <p>
          Update the contact information below.
        </p>
      </div>


      <button
        type="button"
        class="back-button"
        @click="goBack"
      >
        <span class="back-arrow">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path :d="ICONS.chevronLeft" />
          </svg>
        </span>
        <span>Back to Contacts</span>
      </button>

    </div>


    <!-- =====================================================
         PROFILE HERO
    ====================================================== -->

    <div class="detail-grid">

    <div
      v-if="!loading && !loadError"
      class="profile-hero-card"
    >

      <span
        class="profile-hero-avatar"
        aria-hidden="true"
      >
        {{ detailInitials }}
      </span>


      <div class="profile-hero-id">
        <span class="section-label">
          CONTACT PROFILE
        </span>

        <h2>
          {{ form.name || "Untitled contact" }}
        </h2>

        <p class="profile-hero-meta">
          <span
            class="contact-category"
            :class="detailChipClass"
          >
            {{ form.category || "FRIEND" }}
          </span>

          <span v-if="sinceLabel">
            Contact since {{ sinceLabel }}
          </span>
        </p>
      </div>


      <button
        type="button"
        class="profile-fav"
        :class="{ 'is-favorite': detailFav }"
        :aria-pressed="detailFav"
        :aria-label="
          detailFav
            ? 'Remove from favorites'
            : 'Add to favorites'
        "
        @click="onToggleDetailFav"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            :d="ICONS.favorites"
            :fill="detailFav ? 'currentColor' : 'none'"
          />
        </svg>

        <span>
          {{ detailFav ? "Favorited" : "Favorite" }}
        </span>
      </button>

    </div>


    <!-- =====================================================
         LOADING
    ====================================================== -->

    <div
      v-if="loading"
      class="message loading-state"
    >
      <div class="loading-spinner"></div>

      <p>
        Loading contact...
      </p>
    </div>


    <!-- =====================================================
         ERROR
    ====================================================== -->

    <div
      v-else-if="loadError"
      class="message error"
    >
      <div class="empty-icon">
        !
      </div>

      <h2>
        Unable to load contact
      </h2>

      <p>
        {{ loadError }}
      </p>

      <button
        type="button"
        class="primary-button"
        @click="loadContact"
      >
        Try Again
      </button>
    </div>


    <!-- =====================================================
         CONTACT FORM
    ====================================================== -->

    <form
      v-else
      class="detail-form"
      @submit.prevent="updateContact"
    >

      <!-- Form title -->
      <div class="form-title">

        <div class="edit-icon">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path :d="ICONS.edit" />
          </svg>
        </div>

        <div>
          <h2>
            Contact Information
          </h2>

          <p>
            Update the details of this contact.
          </p>
        </div>

      </div>


      <!-- ===================================================
           UPDATE ERROR
      ==================================================== -->

      <div
        v-if="updateError"
        class="form-error"
      >
        {{ updateError }}
      </div>


      <!-- ===================================================
           SUCCESS
      ==================================================== -->

      <div
        v-if="successMessage"
        class="form-success"
      >
        {{ successMessage }}
      </div>


      <!-- ===================================================
           NAME
      ==================================================== -->

      <div class="form-group">

        <label for="name">
          Full Name
          <span>*</span>
        </label>

        <input
          id="name"
          v-model.trim="form.name"
          type="text"
          maxlength="255"
          autocomplete="name"
          placeholder="Enter full name"
          required
        />

      </div>


      <!-- ===================================================
           PHONE
      ==================================================== -->

      <div class="form-group">

        <label for="phone_number">
          Phone Number
          <span>*</span>
        </label>

        <input
          id="phone_number"
          v-model.trim="form.phone_number"
          type="tel"
          autocomplete="tel"
          placeholder="+919876543210"
          required
        />

      </div>


      <!-- ===================================================
           EMAIL
      ==================================================== -->

      <div class="form-group">

        <label for="email">
          Email
        </label>

        <input
          id="email"
          v-model.trim="form.email"
          type="email"
          autocomplete="email"
          placeholder="example@email.com"
        />

      </div>


      <!-- ===================================================
           ADDRESS
      ==================================================== -->

      <div class="form-group">

        <label for="address">
          Address
        </label>

        <textarea
          id="address"
          v-model.trim="form.address"
          rows="4"
          placeholder="Enter address"
        ></textarea>

      </div>


      <!-- ===================================================
           CATEGORY
      ==================================================== -->

      <div class="form-group">

        <label for="category">
          Category
          <span>*</span>
        </label>

        <UiDropdown
          input-id="category"
          v-model="form.category"
          :options="CATEGORY_OPTIONS"
          label="Category"
        />

      </div>


      <!-- ===================================================
           ACTIONS
      ==================================================== -->

      <div class="form-actions">

        <button
          type="button"
          class="secondary-button"
          :disabled="saving"
          @click="goBack"
        >
          Cancel
        </button>


        <button
          type="submit"
          class="save-button"
          :class="{ 'is-saved': saved }"
          :disabled="saving || saved"
        >

          <span v-if="saving">
            Saving...
          </span>

          <span
            v-else-if="saved"
            class="save-saved"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Saved
          </span>

          <span v-else>
            Save Changes
          </span>

        </button>

      </div>

    </form>

    </div>

  </section>
</template>


<script setup>
import {
  computed,
  reactive,
  ref,
  onMounted,
} from "vue";

import {
  useRoute,
  useRouter,
} from "vue-router";

import api from "../services/api";

import UiDropdown from "../components/UiDropdown.vue";

import {
  toast,
} from "../services/ui";

import {
  useFavorites,
} from "../composables/useFavorites";

import {
  ICONS,
} from "../icons";


/* =========================================================
   Router
========================================================= */

const route = useRoute();
const router = useRouter();


/* =========================================================
   Contact ID
========================================================= */

const contactId =
  Number(route.params.contactId);


/* =========================================================
   State
========================================================= */

const loading = ref(true);

const saving = ref(false);

const saved = ref(false);

const loadError = ref("");

const updateError = ref("");

const successMessage = ref("");


/* =========================================================
   Form
========================================================= */

const CATEGORY_OPTIONS = [
  { value: "WORK", label: "Work" },
  { value: "FAMILY", label: "Family" },
  { value: "FRIEND", label: "Friend" },
];

const form = reactive({
  name: "",
  phone_number: "",
  email: "",
  address: "",
  category: "FRIEND",
});

const createdAt = ref("");


/* =========================================================
   Load Contact
========================================================= */

const loadContact = async () => {

  loading.value = true;

  loadError.value = "";

  try {

    if (
      !contactId ||
      Number.isNaN(contactId)
    ) {
      throw new Error(
        "Invalid contact ID."
      );
    }


    const response =
      await api.get(
        `/contacts/${contactId}`
      );


    const contact =
      response.data;


    form.name =
      contact.name || "";


    form.phone_number =
      contact.phone_number || "";


    form.email =
      contact.email || "";


    form.address =
      contact.address || "";


    /*
     * Existing contacts created
     * before categories were added
     * may not have a category.
     */
    form.category =
      contact.category ||
      "FRIEND";


    createdAt.value =
      contact.created_at || "";

  } catch (error) {

    console.error(
      "Load contact error:",
      error
    );


    loadError.value =
      error?.response?.data?.detail ||
      error?.message ||
      "Unable to load contact.";

  } finally {

    loading.value = false;
  }
};


/* =========================================================
   Validation
========================================================= */

const validateForm = () => {

  const name =
    form.name.trim();

  const phone =
    form.phone_number.trim();

  const email =
    form.email.trim();


  /* Name */

  if (!name) {

    updateError.value =
      "Please enter the contact name.";

    return false;
  }


  /* Phone */

  if (!phone) {

    updateError.value =
      "Please enter a phone number.";

    return false;
  }


  /*
   * Accept numbers with an optional +
   * and common separators.
   */
  const phonePattern =
    /^\+?[0-9\s().-]{7,20}$/;


  const digitsOnly =
    phone.replace(
      /\D/g,
      ""
    );


  if (
    !phonePattern.test(phone) ||
    digitsOnly.length < 7 ||
    digitsOnly.length > 20
  ) {

    updateError.value =
      "Please enter a valid phone number.";

    return false;
  }


  /* Email */

  if (email) {

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(email)
    ) {

      updateError.value =
        "Please enter a valid email address.";

      return false;
    }
  }


  /* Category */

  const validCategories = [
    "WORK",
    "FAMILY",
    "FRIEND",
  ];


  if (
    !validCategories.includes(
      form.category
    )
  ) {

    updateError.value =
      "Please select a valid category.";

    return false;
  }


  return true;
};


/* =========================================================
   Update Contact
========================================================= */

const updateContact = async () => {

  updateError.value = "";

  successMessage.value = "";

  saved.value = false;


  if (!validateForm()) {
    return;
  }


  saving.value = true;


  try {

    const payload = {

      name:
        form.name.trim(),

      phone_number:
        form.phone_number.trim(),

      email:
        form.email.trim() || null,

      address:
        form.address.trim() || null,

      category:
        form.category,
    };


    await api.put(
      `/contacts/${contactId}`,
      payload
    );


    successMessage.value =
      "Contact updated successfully.";

    saved.value = true;


    /*
     * Give the user a moment to see
     * the success message, then return
     * to the dashboard.
     */
    setTimeout(() => {

      router.push(
        "/contacts"
      );

    }, 500);

  } catch (error) {

    console.error(
      "Update contact error:",
      error
    );


    if (
      error?.response?.status === 409
    ) {

      updateError.value =
        error.response.data?.detail ||
        "A contact with these details already exists.";

    }

    else if (
      error?.response?.status === 422
    ) {

      const detail =
        error.response.data?.detail;


      if (
        Array.isArray(detail)
      ) {

        updateError.value =
          detail
            .map(
              (item) =>
                item.msg
            )
            .join(", ");

      } else {

        updateError.value =
          detail ||
          "Please check the entered information.";
      }

    }

    else {

      updateError.value =
        error?.response?.data?.detail ||
        "Unable to update contact. Please try again.";
    }

  } finally {

    saving.value = false;
  }
};


/* =========================================================
   Back
========================================================= */

/* =========================================================
   Profile hero (presentational — reads the same form)
======================================================== */

const {
  isFavorite,
  toggleFavorite,
} = useFavorites();


const detailFav = computed(() =>
  isFavorite(contactId),
);


const onToggleDetailFav = () => {
  const nowFavorite = toggleFavorite(contactId);

  toast(
    "success",
    nowFavorite
      ? "Added to favorites"
      : "Removed from favorites",
    form.name || "Contact",
  );
};


const detailInitials = computed(() => {
  const parts = String(form.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] + parts[parts.length - 1][0]
  ).toUpperCase();
});


const detailChipClass = computed(() => {
  if (form.category === "WORK") {
    return "category-work";
  }

  if (form.category === "FAMILY") {
    return "category-family";
  }

  return "category-friend";
});


const sinceLabel = computed(() => {
  const date = new Date(createdAt.value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
});


const goBack = () => {

  router.push(
    "/contacts"
  );
};


/* =========================================================
   Initial load
========================================================= */

onMounted(() => {
  loadContact();
});
</script>