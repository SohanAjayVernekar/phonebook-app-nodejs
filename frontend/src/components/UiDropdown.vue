<template>
  <div
    ref="rootRef"
    class="ui-dropdown"
    :class="{ open: open }"
  >
    <button
      ref="triggerRef"
      type="button"
      class="ui-dropdown-trigger"
      :id="inputId || undefined"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-label="label"
      @click="toggle"
      @keydown="onTriggerKey"
    >
      <span class="ui-dropdown-value">
        {{ currentLabel }}
      </span>

      <svg
        class="ui-dropdown-chevron"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <transition name="ui-dropdown-pop">
      <ul
        v-if="open"
        ref="menuRef"
        class="ui-dropdown-menu"
        role="listbox"
        :aria-label="label"
        @keydown="onMenuKey"
      >
        <li
          v-for="opt in options"
          :key="String(opt.value)"
        >
          <button
            type="button"
            role="option"
            class="ui-dropdown-option"
            :class="{
              selected: isSelected(opt),
            }"
            :aria-selected="isSelected(opt)"
            :data-value="String(opt.value)"
            @click="pick(opt)"
          >
            <span class="ui-dropdown-option-label">
              {{ opt.label }}
            </span>

            <svg
              v-if="isSelected(opt)"
              class="ui-dropdown-check"
              width="13"
              height="13"
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
          </button>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
} from "vue";


/*
 * Floating dropdown (custom listbox).
 *
 * Drop-in replacement for a native <select>:
 * same value semantics, emits update:modelValue
 * + change so existing handlers keep working.
 */

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },

  options: {
    type: Array,
    default: () => [],
  },

  label: {
    type: String,
    default: "Choose an option",
  },

  inputId: {
    type: String,
    default: "",
  },
});


const emit = defineEmits([
  "update:modelValue",
  "change",
]);


const open = ref(false);

const rootRef = ref(null);

const triggerRef = ref(null);

const menuRef = ref(null);


const currentLabel = computed(() => {
  const found = props.options.find(
    (opt) => opt.value === props.modelValue,
  );

  return found ? found.label : "";
});


const isSelected = (opt) =>
  opt.value === props.modelValue;


const focusOption = (value) => {
  const buttons =
    menuRef.value?.querySelectorAll("button[data-value]") || [];

  for (const btn of buttons) {
    if (btn.dataset.value === String(value)) {
      btn.focus();
      return;
    }
  }
};


const openMenu = () => {
  open.value = true;

  nextTick(() => {
    const selected = props.options.find(
      (opt) => opt.value === props.modelValue,
    );

    focusOption(
      selected ? selected.value : props.options[0]?.value,
    );

    const selectedEl =
      menuRef.value?.querySelector(
        '[aria-selected="true"]',
      );

    if (typeof selectedEl?.scrollIntoView === "function") {
      selectedEl.scrollIntoView({ block: "nearest" });
    }
  });
};


const closeMenu = (refocus = false) => {
  open.value = false;

  if (refocus) {
    nextTick(() => {
      triggerRef.value?.focus();
    });
  }
};


const toggle = () => {
  if (open.value) {
    closeMenu();
  } else {
    openMenu();
  }
};


const pick = (opt) => {
  if (opt.value !== props.modelValue) {
    emit("update:modelValue", opt.value);
    emit("change", opt.value);
  }

  closeMenu(true);
};


const onTriggerKey = (event) => {
  if (
    event.key === "ArrowDown" ||
    event.key === "Enter" ||
    event.key === " "
  ) {
    event.preventDefault();
    openMenu();
  }
};


const moveFocus = (direction) => {
  const current = document.activeElement?.dataset?.value;

  let index = props.options.findIndex(
    (opt) => String(opt.value) === current,
  );

  if (index < 0) {
    index = direction > 0 ? -1 : 0;
  }

  const next =
    (index + direction + props.options.length) %
    props.options.length;

  focusOption(props.options[next].value);
};


const onMenuKey = (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeMenu(true);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    moveFocus(1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    moveFocus(-1);
  } else if (event.key === "Tab") {
    closeMenu();
  }
};


const onPointerDown = (event) => {
  if (
    open.value &&
    rootRef.value &&
    !rootRef.value.contains(event.target)
  ) {
    closeMenu();
  }
};


window.addEventListener("pointerdown", onPointerDown);


onBeforeUnmount(() => {
  window.removeEventListener("pointerdown", onPointerDown);
});
</script>
