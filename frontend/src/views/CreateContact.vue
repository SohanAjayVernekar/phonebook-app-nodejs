<template>
  <section class="create-contact-page">

    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->

    <div class="page-header">
      <div>
        <span class="section-label">
          DIRECTORY
        </span>

        <h1>
          Add Contact
        </h1>

        <p>
          Create a new contact for your phonebook.
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
        <span>Back</span>
      </button>
    </div>


    <!-- =====================================================
         CONTACT FORM
    ====================================================== -->

    <form
      class="contact-form"
      @submit.prevent="createContact"
    >

      <!-- Form heading -->
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
            <path :d="ICONS.plus" />
          </svg>
        </div>

        <div>
          <h2>
            Contact Information
          </h2>

          <p>
            Enter the details below.
          </p>
        </div>

      </div>


      <!-- ===================================================
           ERROR MESSAGE
      ==================================================== -->

      <div
        v-if="error"
        class="form-error"
      >
        {{ error }}
      </div>


      <p class="form-section">
        PERSONAL
      </p>


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


      <p class="form-section">
        CONTACT
      </p>


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


      <p class="form-section">
        ORGANIZATION
      </p>


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
            Create Contact
          </span>

        </button>

      </div>

    </form>

  </section>
</template>


<script setup>
import {
  reactive,
  ref,
} from "vue";

import {
  useRouter,
} from "vue-router";

import api from "../services/api";

import UiDropdown from "../components/UiDropdown.vue";

import {
  ICONS,
} from "../icons";


/* Category options for the floating dropdown. */
const CATEGORY_OPTIONS = [
  { value: "WORK", label: "Work" },
  { value: "FAMILY", label: "Family" },
  { value: "FRIEND", label: "Friend" },
];


/* =========================================================
   Router
========================================================= */

const router = useRouter();


/* =========================================================
   Form
========================================================= */

const form = reactive({
  name: "",
  phone_number: "",
  email: "",
  address: "",
  category: "FRIEND",
});


/* =========================================================
   State
========================================================= */

const saving = ref(false);

const saved = ref(false);

const error = ref("");


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
    error.value =
      "Please enter the contact name.";

    return false;
  }


  /* Phone */

  if (!phone) {
    error.value =
      "Please enter a phone number.";

    return false;
  }


  /*
   * Allows:
   *
   * +919876543210
   * +91 9876543210
   * 919876543210
   * 9876543210
   *
   * Spaces, brackets, dots and hyphens
   * are also accepted.
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
    error.value =
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
      error.value =
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
    error.value =
      "Please select a valid category.";

    return false;
  }


  return true;
};


/* =========================================================
   CREATE CONTACT
========================================================= */

const createContact = async () => {

  error.value = "";

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


    await api.post(
      "/contacts",
      payload
    );


    /*
     * Show the success state briefly,
     * then go to the dashboard.
     */
    saved.value = true;

    setTimeout(() => {

      router.push(
        "/contacts"
      );

    }, 650);

  } catch (err) {

    console.error(
      "Create contact error:",
      err
    );


    /* Duplicate entry */

    if (
      err?.response?.status === 409
    ) {

      error.value =
        err.response.data?.detail ||
        "A contact with these details already exists.";

    }

    /* Validation error */

    else if (
      err?.response?.status === 422
    ) {

      /*
       * FastAPI/Pydantic may return
       * detail as an array.
       */
      const detail =
        err.response.data?.detail;


      if (Array.isArray(detail)) {

        error.value =
          detail
            .map(
              (item) =>
                item.msg
            )
            .join(", ");

      } else {

        error.value =
          detail ||
          "Please check the entered information.";
      }

    }

    /* General error */

    else {

      error.value =
        err?.response?.data?.detail ||
        "Unable to create contact. Please try again.";
    }

  } finally {

    saving.value = false;
  }
};


/* =========================================================
   BACK / CANCEL
========================================================= */

const goBack = () => {

  /*
   * Never return to "/".
   *
   * "/" is the cover page.
   */
  router.push(
    "/contacts"
  );
};
</script>