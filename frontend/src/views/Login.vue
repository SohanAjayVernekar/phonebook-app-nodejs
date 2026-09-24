<template>
  <div class="login-page auth-split">

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
          Every contact,
          <span>beautifully organized.</span>
        </h2>

        <p class="auth-sub">
          Manage, organize, search and connect with
          all your contacts from one beautiful workspace.
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
          <div class="auth-prev-card p1">
            <span class="auth-prev-avatar a1">SW</span>

            <span class="auth-prev-text">
              <strong>Sarah Williams</strong>
              <span>+91 98765 43210</span>
              <span>sarah@email.com</span>
            </span>

            <span class="auth-prev-chip work">Work</span>
          </div>

          <div class="auth-prev-card p2">
            <span class="auth-prev-avatar a2">AJ</span>

            <span class="auth-prev-text">
              <strong>Alex Johnson</strong>
              <span>+1 415 555 2671</span>
              <span>alex@email.com</span>
            </span>

            <span class="auth-prev-chip friend">Friend</span>
          </div>

          <div class="auth-prev-card p3">
            <span class="auth-prev-avatar a3">NP</span>

            <span class="auth-prev-text">
              <strong>Neha Patel</strong>
              <span>+91 99110 33445</span>
              <span>neha@email.com</span>
            </span>

            <span class="auth-prev-chip family">Family</span>
          </div>

          <div class="auth-prev-card p4">
            <span class="auth-prev-avatar a4">RK</span>

            <span class="auth-prev-text">
              <strong>Rohan Kumar</strong>
              <span>+91 98220 11223</span>
              <span>rohan@email.com</span>
            </span>

            <span class="auth-prev-chip work">Work</span>
          </div>
        </div>
      </div>
    </aside>

    <div class="auth-form-side">

    <div class="login-shell">

      <main class="login-card">

      <!-- Header -->
      <div class="login-header">

        <h1 class="login-heading">
          Welcome Back
        </h1>

        <p>
          Sign in to manage your contacts
        </p>

      </div>


      <!-- Error -->
      <div
        v-if="authStore.error"
        class="login-error"
      >
        {{ authStore.error }}
      </div>


      <!-- Login Form -->
      <form
        class="login-form"
        @submit.prevent="handleLogin"
      >

        <!-- Email -->
        <div class="login-field">

          <label for="email">
            Email Address
          </label>

          <div class="login-input-wrap">
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
                x="3"
                y="5"
                width="18"
                height="14"
                rx="3"
              />
              <path d="M3.5 7l8.5 6 8.5-6" />
            </svg>

            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your email"
              autocomplete="email"
              required
            />
          </div>

        </div>


        <!-- Password -->
        <div class="login-field">

          <label
            for="password"
            class="password-label"
          >
            <span>Password</span>

            <button
              type="button"
              class="login-show-password"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? "Hide" : "Show" }}
            </button>

          </label>

          <div class="login-password-wrapper">
            <svg
              class="login-input-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="2.5"
              />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>

            <input
              id="password"
              v-model="password"
              :type="
                showPassword
                  ? 'text'
                  : 'password'
              "
              placeholder="Enter your password"
              autocomplete="current-password"
              required
            />

          </div>

        </div>


        <div class="login-options">
          <label class="login-remember">
            <input
              v-model="rememberMe"
              type="checkbox"
            />
            <span>Remember me</span>
          </label>
        </div>


        <!-- Submit -->
        <button
          type="submit"
          class="login-submit"
          :disabled="authStore.loading"
        >

          <span
            v-if="authStore.loading"
            class="loading-spinner"
          ></span>

          <span>
            {{
              authStore.loading
                ? "Signing In..."
                : "Sign In"
            }}
          </span>

        </button>

      </form>

      <div class="login-demo">
        <button
          type="button"
          class="login-demo-button"
          @click="useDemoAccount"
        >
          Use test account
        </button>
      </div>

      <div class="login-register">
        <span>Don't have an account?</span>

        <button
          type="button"
          @click="goToRegister"
        >
          Create Account
        </button>
      </div>

      </main>

    </div>

    </div>

  </div>
</template>


<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();


/* =========================================================
   FORM DATA
========================================================= */

const email = ref("");
const password = ref("");

const showPassword = ref(false);

const rememberMe = ref(false);

const REMEMBER_KEY = "pb.remember_email";

onMounted(() => {
  try {
    const saved = localStorage.getItem(REMEMBER_KEY);

    if (saved) {
      email.value = saved;
      rememberMe.value = true;
    }
  } catch {
    /* storage unavailable — form stays blank */
  }
});

const useDemoAccount = () => {
  email.value = "testuser@example.com";
  password.value = "Test@12345";
};


/* =========================================================
   LOGIN
========================================================= */

const handleLogin = async () => {

  authStore.clearError();

  try {

    await authStore.login(
      email.value,
      password.value
    );

    const redirect =
      route.query.redirect || "/contacts";

    try {
      if (rememberMe.value) {
        localStorage.setItem(
          REMEMBER_KEY,
          email.value
        );
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
    } catch {
      /* storage unavailable — login still succeeds */
    }

    router.push(redirect);

  } catch (error) {

    console.error(
      "Login failed:",
      error
    );

  }
};


/* =========================================================
   REGISTER
========================================================= */

const goToRegister = () => {
  router.push("/register");
};


</script>