<template>
  <article
    ref="rootRef"
    class="contact-card-modern"
    :class="[
      mode === 'list' ? 'list-mode' : 'grid-mode',
      {
        'is-selected': selected,
        'is-focused': focused,
      },
    ]"
    tabindex="0"
    @focus="emit('item-focus')"
    @keydown="onKeydown"
  >

    <!-- Card header -->
    <div class="contact-card-top">

      <div class="profile-area">

        <!-- Selection checkbox (bulk actions) -->
        <label
          v-if="selectable"
          class="card-checkbox"
          title="Select contact"
          @click.stop
        >
          <input
            type="checkbox"
            :checked="selected"
            aria-label="Select contact"
            @change="emit('toggle-select')"
          />
        </label>

        <!-- Avatar -->
        <div class="large-avatar">
          {{ initials }}
        </div>

        <!-- Profile -->
        <div class="profile-details">

          <!-- Name (same label as the table column) -->
          <span class="field-label">
            Name
          </span>

          <!-- Name -->
          <h2>
            {{ contact.name }}
          </h2>

        </div>

      </div>


      <!-- Quick actions: favorite + options -->
      <div class="card-top-actions">

        <!-- Favorite toggle -->
        <button
          type="button"
          class="card-star"
          :class="{ 'is-favorite': isFav }"
          :aria-pressed="isFav"
          :aria-label="
            isFav
              ? 'Remove from favorites'
              : 'Add to favorites'
          "
          :title="
            isFav
              ? 'Remove from favorites'
              : 'Add to favorites'
          "
          @click="onToggleFavorite"
        >
          <svg
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
              :fill="isFav ? 'currentColor' : 'none'"
            />
          </svg>
        </button>


        <!-- Options dropdown -->
        <button
          type="button"
          class="more-button"
          title="Contact options"
          aria-label="Contact options"
          :aria-expanded="optionsOpen"
          @click.stop="toggleOptions"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="5" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="12" cy="19" r="1.8" />
          </svg>
        </button>


        <div
          v-if="optionsOpen"
          class="options-menu"
          role="menu"
          @click.stop
        >

          <button
            type="button"
            role="menuitem"
            @click="viewContact"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path :d="ICONSEye" />
            </svg>
            View details
          </button>


          <router-link
            :to="`/contacts/${contact.id}`"
            role="menuitem"
            @click="closeOptions"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path :d="ICONSEdit" />
            </svg>
            Edit contact
          </router-link>


          <button
            type="button"
            role="menuitem"
            @click="onToggleFavorite"
          >
            <svg
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
                :fill="isFav ? 'currentColor' : 'none'"
              />
            </svg>
            {{
              isFav
                ? "Remove from favorites"
                : "Add to favorites"
            }}
          </button>


          <button
            type="button"
            role="menuitem"
            class="danger"
            :disabled="deleting"
            @click="deleteContact"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path :d="ICONSTrash" />
            </svg>
            {{
              deleting
                ? "Deleting…"
                : "Delete contact"
            }}
          </button>

        </div>

      </div>

    </div>


    <!-- Contact information
         Same clear labels as the table columns:
         Name · Phone Number · Email Address · Category · Address -->
    <div class="contact-fields">

      <!-- Phone Number -->
      <div class="contact-field">

        <span class="field-label">
          Phone Number
        </span>

        <strong class="field-value phone-value">
          <a
            :href="phoneLink"
            class="contact-link"
            :title="contact.phone_number"
          >
            {{ contact.phone_number }}
          </a>
        </strong>

      </div>


      <!-- Email Address -->
      <div class="contact-field">

        <span class="field-label">
          Email Address
        </span>

        <strong
          v-if="contact.email"
          class="field-value"
        >
          <a
            :href="emailLink"
            class="contact-link"
            :title="contact.email"
          >
            {{ contact.email }}
          </a>
        </strong>

        <strong
          v-else
          class="field-value field-empty"
        >
          —
        </strong>

      </div>


      <!-- Category -->
      <div class="contact-field">

        <span class="field-label">
          Category
        </span>

        <span
          class="contact-category"
          :class="categoryClass"
        >
          {{ categoryLabel }}
        </span>

      </div>


      <!-- Address -->
      <div class="contact-field">

        <span class="field-label">
          Address
        </span>

        <strong
          v-if="contact.address"
          class="field-value address-value"
          :title="contact.address"
        >
          {{ contact.address }}
        </strong>

        <strong
          v-else
          class="field-value field-empty"
        >
          —
        </strong>

      </div>

    </div>


    <!-- Divider -->
    <div class="card-divider"></div>


    <!-- Actions -->
    <div class="modern-card-actions">

      <!-- Edit -->
      <router-link
        :to="`/contacts/${contact.id}`"
        class="edit-contact-button"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="ICONSEdit" />
        </svg>
        <span>
          Edit Contact
        </span>
      </router-link>


      <!-- Delete -->
      <button
        type="button"
        class="delete-contact-button"
        :disabled="deleting"
        @click="deleteContact"
      >
        <span v-if="deleting">
          Deleting...
        </span>

        <span
          v-else
          class="delete-label"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path :d="ICONSTrash" />
          </svg>
          Delete
        </span>
      </button>

    </div>

  </article>
</template>


<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";

import api from "../services/api";

import {
  confirmAction,
  toast,
} from "../services/ui";

import {
  useFavorites,
} from "../composables/useFavorites";

import {
  ICONS,
} from "../icons";


/* =========================================================
   LOCAL ICON PATHS
   (not part of the shared icon set)
========================================================= */

const ICONSEye =
  "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z " +
  "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z";

const ICONSEdit =
  "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z";

const ICONSTrash =
  "M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 " +
  "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 " +
  "M10 11v6 M14 11v6";


/* =========================================================
   Props
========================================================= */

const props = defineProps({
  contact: {
    type: Object,
    required: true,
  },

  /*
   * "grid" = card layout, "list" = compact row layout.
   */
  mode: {
    type: String,
    default: "grid",
  },

  selectable: {
    type: Boolean,
    default: false,
  },

  selected: {
    type: Boolean,
    default: false,
  },

  focused: {
    type: Boolean,
    default: false,
  },
});


/* =========================================================
   Events
========================================================= */

const emit = defineEmits([
  "contact-deleted",
  "toggle-select",
  "item-focus",
  "open",
]);


/* =========================================================
   State
========================================================= */

const deleting = ref(false);

const rootRef = ref(null);

const optionsOpen = ref(false);


/* =========================================================
   Favorites (shared, persisted pb.favorites)
========================================================= */

const {
  isFavorite,
  toggleFavorite,
} = useFavorites();


const isFav = computed(() => {
  return isFavorite(props.contact?.id);
});


const onToggleFavorite = () => {

  const nowFavorite = toggleFavorite(
    props.contact.id,
  );

  toast(
    "success",
    nowFavorite
      ? "Added to favorites"
      : "Removed from favorites",
    props.contact.name,
  );

  closeOptions();
};


/* =========================================================
   Initials
========================================================= */

const initials = computed(() => {

  const name =
    props.contact?.name?.trim() || "";

  if (!name) {
    return "?";
  }

  const parts =
    name
      .split(/\s+/)
      .filter(Boolean);


  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }


  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
});


/* =========================================================
   Category
========================================================= */

const categoryLabel = computed(() => {

  const category =
    props.contact?.category;


  if (category === "WORK") {
    return "WORK";
  }

  if (category === "FAMILY") {
    return "FAMILY";
  }

  return "FRIEND";
});


const categoryClass = computed(() => {

  if (
    props.contact?.category === "WORK"
  ) {
    return "category-work";
  }

  if (
    props.contact?.category === "FAMILY"
  ) {
    return "category-family";
  }

  return "category-friend";
});


/* =========================================================
   Phone
========================================================= */

const phoneLink = computed(() => {

  const phone =
    props.contact?.phone_number || "";

  const cleanPhone =
    phone.replace(
      /[^0-9+]/g,
      ""
    );

  return `tel:${cleanPhone}`;
});


/* =========================================================
   Email
========================================================= */

const emailLink = computed(() => {

  if (!props.contact?.email) {
    return "#";
  }

  return `mailto:${props.contact.email}`;
});


/* =========================================================
   Keyboard (Enter opens, Space selects)
========================================================= */

const onKeydown = (event) => {

  /*
   * Ignore keys pressed inside buttons,
   * links, and the checkbox.
   */
  if (event.target !== event.currentTarget) {
    return;
  }


  if (event.key === "Enter") {
    event.preventDefault();
    emit("open");
    return;
  }


  if (event.key === " ") {
    event.preventDefault();

    if (props.selectable) {
      emit("toggle-select");
    }
  }
};


/* =========================================================
   Options dropdown
========================================================= */

const toggleOptions = () => {
  optionsOpen.value = !optionsOpen.value;
};


const closeOptions = () => {
  optionsOpen.value = false;
};


const viewContact = () => {
  closeOptions();

  emit("open");
};


/*
 * Click / Escape outside the card closes the menu.
 */
const onDocumentClick = (event) => {

  const root = rootRef.value;

  if (!root) {
    closeOptions();

    return;
  }


  if (
    event.target instanceof Node &&
    !root.contains(event.target)
  ) {
    closeOptions();
  }
};


const onDocumentKeydown = (event) => {
  if (event.key === "Escape") {
    closeOptions();
  }
};


onMounted(() => {
  document.addEventListener(
    "click",
    onDocumentClick,
  );

  document.addEventListener(
    "keydown",
    onDocumentKeydown,
  );
});


onBeforeUnmount(() => {
  document.removeEventListener(
    "click",
    onDocumentClick,
  );

  document.removeEventListener(
    "keydown",
    onDocumentKeydown,
  );
});


/* =========================================================
   Delete
========================================================= */

const deleteContact = async () => {

  if (deleting.value) {
    return;
  }


  const confirmed = await confirmAction({
    title: `Delete "${props.contact.name}"?`,
    message:
      "This contact will be permanently removed from your phonebook.",
    confirmText: "Delete",
    danger: true,
  });


  if (!confirmed) {
    return;
  }


  deleting.value = true;


  try {

    await api.delete(
      `/contacts/${props.contact.id}`
    );


    emit(
      "contact-deleted",
      props.contact.id
    );


    toast(
      "success",
      "Contact deleted",
      props.contact.name,
    );

  } catch (error) {

    console.error(
      "Delete contact error:",
      error
    );


    const message =
      error?.response?.data?.detail ||
      "Unable to delete contact. Please try again.";


    toast(
      "error",
      "Delete failed",
      message,
    );

  } finally {

    deleting.value = false;

    closeOptions();
  }
};
</script>


<style scoped>
/* ---------- top action cluster ---------- */

.card-top-actions {
  position: relative;

  display: flex;
  align-items: center;

  gap: 8px;

  margin-left: auto;
}


/* favorite star */
.card-star {
  width: 34px;
  height: 34px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  padding: 0;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card);

  color: var(--text-faint);

  transition:
    background 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;
}

.card-star svg {
  width: 16px;
  height: 16px;
}

.card-star:hover {
  background: var(--bg-hover);

  color: var(--warning);

  border-color: var(--warning-border);

  transform: translateY(-1px);
}

.card-star.is-favorite {
  background: var(--warning-soft);

  border-color: var(--warning-border);

  color: var(--warning);
}


/* the more-button dots svg */
.more-button svg {
  width: 16px;
  height: 16px;
}


/* ---------- dropdown menu ---------- */

.options-menu {
  position: absolute;

  top: calc(100% + 6px);
  right: 0;

  z-index: 40;

  min-width: 200px;

  display: flex;
  flex-direction: column;

  gap: 2px;

  padding: 6px;

  border: 1px solid var(--border);
  border-radius: 12px;

  background: var(--bg-elevated);

  box-shadow: var(--shadow-lg);

  animation:
    options-in 0.14s ease-out;
}

@keyframes options-in {
  from {
    opacity: 0;

    transform: translateY(-4px);
  }

  to {
    opacity: 1;

    transform: translateY(0);
  }
}

.options-menu button,
.options-menu a {
  display: flex;
  align-items: center;

  gap: 9px;

  width: 100%;

  padding: 8px 10px;

  border: none;
  border-radius: 8px;

  background: transparent;

  color: var(--text-secondary);

  font-size: 12.5px;
  font-weight: 650;

  text-align: left;

  text-decoration: none;

  cursor: pointer;

  transition:
    background 0.14s ease,
    color 0.14s ease;
}

.options-menu button svg,
.options-menu a svg {
  width: 15px;
  height: 15px;

  flex-shrink: 0;
}

.options-menu button:hover,
.options-menu a:hover {
  background: var(--bg-hover);

  color: var(--text-primary);
}

.options-menu button.danger {
  color: var(--danger-text);
}

.options-menu button.danger:hover {
  background: var(--danger-soft);
}

.options-menu button:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}


/* ---------- action row icons ---------- */

.modern-card-actions .edit-contact-button,
.modern-card-actions .delete-contact-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 7px;
}

.modern-card-actions svg {
  width: 14px;
  height: 14px;

  flex-shrink: 0;
}

.delete-label {
  display: inline-flex;
  align-items: center;

  gap: 7px;
}
</style>
