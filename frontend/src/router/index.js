import {
  createRouter,
  createWebHistory,
} from "vue-router";


import Home from
  "../views/Home.vue";

import ContactList from
  "../views/ContactList.vue";

import CreateContact from
  "../views/CreateContact.vue";

import ContactDetail from
  "../views/ContactDetail.vue";

import Login from
  "../views/Login.vue";

import Register from
  "../views/Register.vue";

import Profile from
  "../views/Profile.vue";

import Settings from
  "../views/Settings.vue";

import Dashboard from
  "../views/Dashboard.vue";

import Favorites from
  "../views/Favorites.vue";

import Categories from
  "../views/Categories.vue";

import ImportContacts from
  "../views/Import.vue";

import ExportContacts from
  "../views/Export.vue";

import NotFound from
  "../views/NotFound.vue";


const router = createRouter({

  history: createWebHistory(),


  routes: [

    {
      path: "/",
      name: "home",
      component: Home,

      meta: {
        title: "Home",
      },
    },


    // =====================================================
    // Login
    // =====================================================

    {
      path: "/login",
      name: "login",
      component: Login,

      meta: {
        guestOnly: true,
        title: "Sign in",
      },
    },


    // =====================================================
    // Register
    // =====================================================

    {
      path: "/register",
      name: "register",
      component: Register,

      meta: {
        guestOnly: true,
        title: "Create account",
      },
    },


    // =====================================================
    // Dashboard
    // =====================================================

    {
      path: "/dashboard",
      name: "dashboard",
      component: Dashboard,

      meta: {
        requiresAuth: true,
        title: "Dashboard",
      },
    },


    // =====================================================
    // Contacts
    // =====================================================

    {
      path: "/contacts",
      name: "contacts",
      component: ContactList,

      meta: {
        requiresAuth: true,
        title: "All Contacts",
      },
    },


    // =====================================================
    // Create contact
    // =====================================================

    {
      path: "/contacts/new",
      name: "contact-create",
      component: CreateContact,

      meta: {
        requiresAuth: true,
        title: "Add Contact",
      },
    },


    // =====================================================
    // Contact details
    // =====================================================

    {
      path: "/contacts/:contactId",
      name: "contact-detail",
      component: ContactDetail,

      meta: {
        requiresAuth: true,
        title: "Contact Details",
      },

      props: (route) => ({
        contactId: Number(
          route.params.contactId
        ),
      }),
    },


    // =====================================================
    // Favorites
    // =====================================================

    {
      path: "/favorites",
      name: "favorites",
      component: Favorites,

      meta: {
        requiresAuth: true,
        title: "Favorites",
      },
    },


    // =====================================================
    // Categories
    // =====================================================

    {
      path: "/categories",
      name: "categories",
      component: Categories,

      meta: {
        requiresAuth: true,
        title: "Categories",
      },
    },


    // =====================================================
    // Import / Export
    // =====================================================

    {
      path: "/import",
      name: "import",
      component: ImportContacts,

      meta: {
        requiresAuth: true,
        title: "Import Contacts",
      },
    },


    {
      path: "/export",
      name: "export",
      component: ExportContacts,

      meta: {
        requiresAuth: true,
        title: "Export Contacts",
      },
    },


    // =====================================================
    // Profile
    // =====================================================

    {
      path: "/profile",
      name: "profile",
      component: Profile,

      meta: {
        requiresAuth: true,
        title: "Profile",
      },
    },


    // =====================================================
    // Settings
    // =====================================================

    {
      path: "/settings",
      name: "settings",
      component: Settings,

      meta: {
        requiresAuth: true,
        title: "Settings",
      },
    },


    // =====================================================
    // Not found (catch-all)
    // =====================================================

    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFound,

      meta: {
        requiresAuth: true,
        title: "Page Not Found",
      },
    },

  ],

});


// =========================================================
// Authentication guard
// =========================================================

router.beforeEach(
  (to) => {

    const token =
      localStorage.getItem(
        "access_token"
      );


    // -----------------------------------------------------
    // Protected page
    // -----------------------------------------------------

    if (
      to.meta.requiresAuth &&
      !token
    ) {

      return {
        name: "login",

        query: {
          redirect: to.fullPath,
        },

      };

    }


    // -----------------------------------------------------
    // Guest-only page
    // -----------------------------------------------------

    if (
      to.meta.guestOnly &&
      token
    ) {

      return {
        name: "contacts",
      };

    }


    return true;

  }
);


export default router;
