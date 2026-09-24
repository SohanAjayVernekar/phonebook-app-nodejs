<template>
  <div class="register-page auth-split">

    <aside class="auth-brand">
      <div class="auth-brand-inner">
        <div class="auth-logo">
          <span class="auth-logo-mark">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect
                x="6"
                y="4"
                width="13"
                height="17"
                rx="2.5"
              />
              <path d="M3.5 9H6 M3.5 15H6" />
              <circle
                cx="12.5"
                cy="10"
                r="2.1"
              />
              <path d="M9 16.2c.6-1.9 1.9-2.9 3.5-2.9s2.9 1 3.5 2.9" />
            </svg>
          </span>

          <span class="auth-logo-text">
            <strong>Phonebook App</strong>
            <span>Contact Manager</span>
          </span>
        </div>

        <h2 class="auth-headline">
          Join in seconds,
          stay organized.
        </h2>

        <p class="auth-sub">
          Create your account and bring your
          entire phonebook into one place.
        </p>

        <ul class="auth-points">
          <li>Powerful search and filters</li>
          <li>Categories and favorites</li>
          <li>CSV import and export</li>
        </ul>

        <div
          class="auth-float-cards"
          aria-hidden="true"
        >
          <div class="auth-mini-card m1">
            <span class="auth-mini-avatar a1">AK</span>
            <span class="auth-mini-lines"><i></i><i></i></span>
            <span class="auth-mini-chip work">Work</span>
          </div>

          <div class="auth-mini-card m2">
            <span class="auth-mini-avatar a2">MR</span>
            <span class="auth-mini-lines"><i></i><i></i></span>
            <span class="auth-mini-chip family">Family</span>
          </div>

          <div class="auth-mini-card m3">
            <span class="auth-mini-avatar a3">EP</span>
            <span class="auth-mini-lines"><i></i><i></i></span>
            <span class="auth-mini-chip friend">Friend</span>
          </div>
        </div>
      </div>
    </aside>

    <div class="auth-form-side">

    <div class="register-card">

      <!-- Header -->
      <div class="register-header">

        <div class="register-icon">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path :d="ICONS.profile" />
          </svg>
        </div>

        <div class="register-brand">
          CONNECT
        </div>

        <h1 class="register-heading">
          Create Account
        </h1>

        <p>
          Create your account to manage your contacts
        </p>

      </div>


      <!-- Error -->
      <div
        v-if="authStore.error"
        class="register-error"
      >
        {{ authStore.error }}
      </div>


      <!-- Register Form -->
      <form
        class="register-form"
        @submit.prevent="handleRegister"
      >

        <!-- Name -->
        <div class="register-field">

          <label for="name">
            Full Name
          </label>

          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Enter your full name"
            autocomplete="name"
            required
          />

        </div>


        <!-- Email -->
        <div class="register-field">

          <label for="email">
            Email Address
          </label>

          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            autocomplete="email"
            required
          />

        </div>


        <!-- Password -->
        <div class="register-field">

          <label
            for="password"
            class="register-password-label"
          >
            <span>Password</span>

            <button
              type="button"
              class="register-show-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? "Hide" : "Show" }}
            </button>

          </label>

          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Create a password"
            autocomplete="new-password"
            minlength="8"
            required
          />

          <small>
            Password must contain at least 8 characters.
          </small>

        </div>


        <!-- Confirm Password -->
        <div class="register-field">

          <label
            for="confirmPassword"
            class="register-password-label"
          >
            <span>Confirm Password</span>

            <button
              type="button"
              class="register-show-password"
              @click="
                showConfirmPassword = !showConfirmPassword
              "
            >
              {{ showConfirmPassword ? "Hide" : "Show" }}
            </button>

          </label>

          <input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="
              showConfirmPassword
                ? 'text'
                : 'password'
            "
            placeholder="Confirm your password"
            autocomplete="new-password"
            minlength="8"
            required
          />

        </div>


        <!-- Submit -->
        <button
          type="submit"
          class="register-submit"
          :disabled="authStore.loading"
        >

          <span
            v-if="authStore.loading"
            class="loading-spinner"
          ></span>

          <span>
            {{
              authStore.loading
                ? "Creating Account..."
                : "Create Account"
            }}
          </span>

        </button>

      </form>


      <!-- Login -->
      <div class="register-login">

        <span>
          Already have an account?
        </span>

        <button
          type="button"
          @click="goToLogin"
        >
          Sign In
        </button>

      </div>

    </div>

    </div>

  </div>
</template>


<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { ICONS } from "../icons";

const router = useRouter();
const authStore = useAuthStore();


/* =========================================================
   FORM DATA
========================================================= */

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const showPassword = ref(false);
const showConfirmPassword = ref(false);


/* =========================================================
   REGISTER
========================================================= */

const handleRegister = async () => {

  authStore.clearError();


  if (password.value !== confirmPassword.value) {
    authStore.error = "Passwords do not match.";
    return;
  }


  if (password.value.length < 8) {
    authStore.error =
      "Password must contain at least 8 characters.";
    return;
  }


  try {

    await authStore.register(
      name.value,
      email.value,
      password.value
    );

    router.push("/contacts");

  } catch (error) {

    console.error(
      "Registration failed:",
      error
    );

  }
};


/* =========================================================
   LOGIN
========================================================= */

const goToLogin = () => {
  router.push("/login");
};
</script>