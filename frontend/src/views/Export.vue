<template>
  <section class="export-page">

    <!-- =====================================================
         PAGE HEADING
    ====================================================== -->

    <div class="dashboard-heading">

      <div>
        <span class="section-label">
          EXPORT
        </span>

        <h1>
          Export contacts
        </h1>

        <p>
          Take a copy of your address book with you.
        </p>
      </div>


      <div class="dashboard-date">
        <span>
          FORMAT
        </span>

        <strong>
          {{ format.toUpperCase() }}
        </strong>
      </div>

    </div>


    <!-- =====================================================
         LOADING STATE
    ====================================================== -->

    <div
      v-if="loading"
      class="message loading-state"
    >
      <div
        class="loading-spinner"
        aria-hidden="true"
      ></div>

      <h2>Loading your address book…</h2>

      <p>
        Fetching your contact total and a recent
        snapshot.
      </p>
    </div>


    <!-- =====================================================
         ERROR STATE (initial load) + Retry
    ====================================================== -->

    <div
      v-else-if="loadError"
      class="message error"
    >
      <span class="empty-icon exp-state-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="ICONS.xCircle" />
        </svg>
      </span>

      <h2>We couldn&apos;t load your contacts</h2>

      <p>{{ loadError }}</p>

      <button
        type="button"
        class="primary-button"
        @click="loadScope"
      >
        Retry
      </button>
    </div>


    <!-- =====================================================
         LOADED — scope card + options card
    ====================================================== -->

    <template v-else>

      <div class="export-grid">


        <!-- ============================
             SCOPE CARD
        ============================= -->

        <section
          class="settings-card"
          aria-labelledby="export-scope-title"
        >

          <div class="settings-card-title">
            <span class="settings-icon indigo">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path :d="ICONS.contacts" />
              </svg>
            </span>

            <div>
              <h2 id="export-scope-title">
                What&apos;s in your book
              </h2>

              <p>
                A snapshot of everything ready to
                download.
              </p>
            </div>
          </div>


          <!-- Total -->

          <div class="exp-total">
            <span class="field-label">
              Total contacts
            </span>

            <strong>
              {{ formattedTotal }}
            </strong>
          </div>


          <!-- Categories (distinct, first 100) -->

          <div class="exp-group">
            <span class="field-label">
              Categories present
            </span>

            <div class="exp-chips">
              <span
                v-for="category in presentCategories"
                :key="category"
                class="profile-chip"
              >
                {{ category }}
              </span>

              <span
                v-if="presentCategories.length === 0"
                class="profile-chip"
              >
                None yet
              </span>
            </div>
          </div>


          <!-- Favorites (client-side list) -->

          <div class="exp-group">
            <span class="field-label">
              Favorites
            </span>

            <div class="exp-chips">
              <span class="profile-chip">
                <i
                  class="chip-dot"
                  aria-hidden="true"
                ></i>

                {{ favoriteCount }}
                {{
                  favoriteCount === 1
                    ? "favorite"
                    : "favorites"
                }}
              </span>
            </div>
          </div>


          <p class="settings-note">
            Categories are sampled from your 100 most
            recent contacts — the export itself always
            includes everyone.
          </p>

        </section>


        <!-- ============================
             OPTIONS CARD
        ============================= -->

        <section
          class="settings-card"
          aria-labelledby="export-options-title"
        >

          <div class="settings-card-title">
            <span class="settings-icon violet">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path :d="ICONS.export" />
              </svg>
            </span>

            <div>
              <h2 id="export-options-title">
                Export options
              </h2>

              <p>
                Pick a format and the columns you need.
              </p>
            </div>
          </div>


          <!-- Format selector -->

          <div class="setting-row">
            <div class="setting-text">
              <strong>Format</strong>
              <span>How your file is encoded.</span>
            </div>

            <div
              class="segmented"
              role="group"
              aria-label="Export format"
            >
              <button
                type="button"
                :class="{ active: format === 'csv' }"
                :aria-pressed="format === 'csv'"
                @click="format = 'csv'"
              >
                CSV
              </button>

              <button
                type="button"
                :class="{ active: format === 'json' }"
                :aria-pressed="format === 'json'"
                @click="format = 'json'"
              >
                JSON
              </button>
            </div>
          </div>

          <small class="field-hint">
            {{
              format === "csv"
                ? "CSV — opens in Excel & Sheets"
                : "JSON — full structured data"
            }}
          </small>


          <!-- Include-fields checkboxes -->

          <div class="setting-row">
            <div class="setting-text">
              <strong>Include fields</strong>
              <span>Name and phone are always on.</span>
            </div>

            <fieldset class="exp-fieldset">
              <legend class="field-label">
                Columns
              </legend>

              <div class="exp-checks">
                <label class="field-label exp-check is-locked">
                  <input
                    type="checkbox"
                    checked
                    disabled
                  />
                  Name
                </label>

                <label class="field-label exp-check is-locked">
                  <input
                    type="checkbox"
                    checked
                    disabled
                  />
                  Phone
                </label>

                <label class="field-label exp-check">
                  <input
                    v-model="fields.email"
                    type="checkbox"
                  />
                  Email
                </label>

                <label class="field-label exp-check">
                  <input
                    v-model="fields.category"
                    type="checkbox"
                  />
                  Category
                </label>

                <label class="field-label exp-check">
                  <input
                    v-model="fields.address"
                    type="checkbox"
                  />
                  Address
                </label>
              </div>
            </fieldset>
          </div>


          <!-- Export action -->

          <div class="exp-actions">
            <button
              type="button"
              class="primary-button"
              :disabled="
                total === 0 || exportState === 'exporting'
              "
              @click="runExport"
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
                <path :d="ICONS.export" />
              </svg>

              <span>
                {{
                  exportState === "exporting"
                    ? "Exporting…"
                    : `Export ${formattedTotal} ${
                        total === 1
                          ? "contact"
                          : "contacts"
                      }`
                }}
              </span>
            </button>

            <span
              v-if="total === 0"
              class="field-hint exp-empty-hint"
            >
              No contacts to export
            </span>
          </div>


          <!-- Progress (fetching + building) -->

          <div
            v-if="exportState === 'exporting'"
            class="exp-progress"
          >
            <div
              class="exp-track"
              role="progressbar"
              aria-label="Export progress"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="progressPercent"
            >
              <div
                class="exp-bar"
                :style="{
                  width: progressPercent + '%',
                }"
              ></div>
            </div>

            <p
              class="exp-status"
              aria-live="polite"
            >
              {{ fetchStatus }}
            </p>
          </div>


          <!-- Done chip -->

          <div
            v-else-if="
              exportState === 'done' && lastExport
            "
            class="exp-done"
            role="status"
          >
            <span
              class="exp-done-icon"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path :d="ICONS.checkCircle" />
              </svg>
            </span>

            <div class="exp-done-text">
              <strong>
                Exported {{ lastExport.filename }}
              </strong>

              <span>
                {{ lastExport.size }} ·
                {{ lastExport.count }} contacts
              </span>
            </div>
          </div>


          <!-- Export failure + Retry -->

          <div
            v-else-if="exportState === 'error'"
            class="message error exp-error"
          >
            <span class="empty-icon exp-state-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path :d="ICONS.alertTriangle" />
              </svg>
            </span>

            <h2>Export failed</h2>

            <p>{{ exportError }}</p>

            <button
              type="button"
              class="primary-button"
              @click="runExport"
            >
              Retry
            </button>
          </div>

        </section>

      </div>


      <!-- ===================================================
           EMPTY STATE — nothing to export yet
      ==================================================== -->

      <div
        v-if="total === 0"
        class="message empty"
      >
        <span class="empty-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path :d="ICONS.add" />
          </svg>
        </span>

        <h2>No contacts to export</h2>

        <p>
          Add your first contact and it will show up
          here, ready to download.
        </p>

        <router-link
          to="/contacts/new"
          class="primary-button"
        >
          Add your first contact
        </router-link>
      </div>

    </template>

  </section>
</template>


<script setup>
import {
  computed,
  onMounted,
  reactive,
  ref,
} from "vue";

import { ICONS } from "../icons";

import api from "../services/api";

import { toast } from "../services/ui";

import {
  useFavorites,
} from "../composables/useFavorites";


/* =========================================================
   FAVORITES (client-side, shared module)
========================================================== */

const { favoriteCount } = useFavorites();


/* =========================================================
   CONSTANTS — paging & safety caps
========================================================== */

const PAGE_SIZE = 100;

/* Never pull more than this many rows in one export. */
const EXPORT_CAP = 1000;


/* =========================================================
   STATE — scope
========================================================== */

const loading = ref(true);

const loadError = ref("");

const total = ref(0);

const categories = ref([]);


const formattedTotal = computed(() => {
  return total.value.toLocaleString("en-US");
});


const presentCategories = computed(() => {
  return categories.value;
});


/* =========================================================
   STATE — options
========================================================== */

const format = ref("csv");

const fields = reactive({
  email: true,
  category: true,
  address: true,
});


/* =========================================================
   STATE — export run
   ---------------------------------------------------------
   idle → exporting → done | error
========================================================== */

const exportState = ref("idle");

const fetchStatus = ref("");

const progressPercent = ref(0);

const exportError = ref("");

const lastExport = ref(null);


/* =========================================================
   ERROR HELPER
========================================================== */

const extractError = (error, fallback) => {
  const data = error?.response?.data;

  return (
    data?.detail ||
    data?.message ||
    error?.message ||
    fallback
  );
};


/* =========================================================
   FORMATTING HELPERS
========================================================== */

const formatBytes = (bytes) => {
  const size = Number(bytes) || 0;

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};


const dateStamp = () => {
  const today = new Date();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
};


/* =========================================================
   LOAD SCOPE — total + a 100-row category sample
========================================================== */

const loadScope = async () => {
  loading.value = true;
  loadError.value = "";

  try {
    const [countResponse, sampleResponse] =
      await Promise.all([
        api.get("/contacts", {
          params: {
            page: 1,
            page_size: 1,
          },
        }),

        api.get("/contacts", {
          params: {
            page: 1,
            page_size: PAGE_SIZE,
            sort: "newest",
          },
        }),
      ]);

    total.value = Number(
      countResponse.data.total || 0
    );

    const sample = sampleResponse.data.items || [];

    categories.value = [
      ...new Set(
        sample
          .map((contact) => contact.category)
          .filter(Boolean)
      ),
    ].sort();

  } catch (error) {
    loadError.value = extractError(
      error,
      "We couldn't reach the server. Check your connection and try again."
    );
  } finally {
    loading.value = false;
  }
};


/* =========================================================
   FETCH EVERY CONTACT (paged, capped)
========================================================== */

const fetchAllContacts = async () => {
  const collected = [];

  let page = 1;
  let totalPages = 1;
  let serverTotal = 0;

  do {
    const response = await api.get("/contacts", {
      params: {
        page,
        page_size: PAGE_SIZE,
      },
    });

    const items = response.data.items || [];

    collected.push(...items);

    serverTotal = Number(
      response.data.total || collected.length
    );

    totalPages = Number(
      response.data.total_pages || 1
    );

    fetchStatus.value =
      `Fetching ` +
      `${Math.min(collected.length, EXPORT_CAP)
        .toLocaleString("en-US")} ` +
      `of ${serverTotal.toLocaleString("en-US")}…`;

    progressPercent.value = serverTotal
      ? Math.min(
          90,
          Math.round(
            (collected.length / serverTotal) * 90
          )
        )
      : 90;

    page += 1;

    if (collected.length >= EXPORT_CAP) {
      break;
    }
  } while (page <= totalPages);

  /* Keep the headline total honest after a run. */
  total.value = serverTotal;

  return collected.slice(0, EXPORT_CAP);
};


/* =========================================================
   BUILDERS — CSV (escaped) & JSON
========================================================== */

const selectedHeaders = () => {
  const headers = ["name", "phone_number"];

  if (fields.email) headers.push("email");
  if (fields.category) headers.push("category");
  if (fields.address) headers.push("address");

  return headers;
};


/*
 * RFC 4180 escaping: quote anything holding a
 * comma, a quote or a line break; double quotes
 * inside the field are doubled too.
 */
const escapeCell = (value) => {
  const text =
    value === null || value === undefined
      ? ""
      : String(value);

  return /[",\r\n]/.test(text)
    ? `"${text.replace(/"/g, '""')}"`
    : text;
};


const buildCsv = (contacts) => {
  const headers = selectedHeaders();

  const lines = [headers.join(",")];

  contacts.forEach((contact) => {
    const cells = [
      contact.name,
      contact.phone_number,
    ];

    if (fields.email) {
      cells.push(contact.email || "");
    }

    if (fields.category) {
      cells.push(contact.category || "");
    }

    if (fields.address) {
      cells.push(contact.address || "");
    }

    lines.push(cells.map(escapeCell).join(","));
  });

  /* BOM first so Excel reads UTF-8 correctly. */
  return `\uFEFF${lines.join("\r\n")}\r\n`;
};


const buildJson = (contacts) => {
  const objects = contacts.map((contact) => {
    const entry = {
      name: contact.name,
      phone_number: contact.phone_number,
    };

    if (fields.email) {
      entry.email = contact.email ?? null;
    }

    if (fields.category) {
      entry.category = contact.category ?? null;
    }

    if (fields.address) {
      entry.address = contact.address ?? null;
    }

    return entry;
  });

  return JSON.stringify(objects, null, 2);
};


/* =========================================================
   BLOB DOWNLOAD (createObjectURL → revoke)
========================================================== */

const downloadBlob = (content, mime, filename) => {
  const blob = new Blob([content], { type: mime });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 0);

  return blob.size;
};


/* =========================================================
   RUN EXPORT
========================================================== */

const runExport = async () => {
  if (total.value === 0) {
    return;
  }

  exportState.value = "exporting";
  exportError.value = "";
  fetchStatus.value = "Preparing your export…";
  progressPercent.value = 0;

  try {
    const contacts = await fetchAllContacts();

    fetchStatus.value =
      `Building ${format.toUpperCase()} file…`;

    progressPercent.value = 95;

    const stamp = dateStamp();

    let content;
    let mime;
    let filename;

    if (format.value === "json") {
      content = buildJson(contacts);
      mime = "application/json";
      filename = `contacts-${stamp}.json`;
    } else {
      content = buildCsv(contacts);
      mime = "text/csv;charset=utf-8";
      filename = `contacts-${stamp}.csv`;
    }

    const size = downloadBlob(content, mime, filename);

    progressPercent.value = 100;

    lastExport.value = {
      filename,
      size: formatBytes(size),
      count: contacts.length,
    };

    fetchStatus.value = "";
    exportState.value = "done";

    toast(
      "success",
      "Export ready",
      `${filename} · ${formatBytes(size)} downloaded.`
    );

  } catch (error) {
    exportState.value = "error";
    fetchStatus.value = "";

    exportError.value = extractError(
      error,
      "We couldn't fetch your contacts for export."
    );

    toast(
      "error",
      "Export failed",
      exportError.value
    );
  }
};


/* =========================================================
   MOUNT — read the scope snapshot
========================================================== */

onMounted(() => {
  loadScope();
});
</script>


<style scoped>
/* =========================================================
   PAGE SHELL
======================================================== */

.export-page {
  width: 100%;
}


/* =========================================================
   SCOPE + OPTIONS GRID
======================================================== */

.export-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 20px;

  align-items: start;
}


/* =========================================================
   SCOPE CARD
======================================================== */

.exp-total {
  display: flex;
  flex-direction: column;

  gap: 6px;

  margin-bottom: 18px;
}

.exp-total strong {
  color: var(--text-primary);

  font-size: 34px;
  font-weight: 850;

  letter-spacing: -1px;

  line-height: 1;
}

.exp-group {
  margin-top: 16px;
}

.exp-chips {
  display: flex;
  flex-wrap: wrap;

  gap: 8px;

  margin-top: 7px;
}

.settings-icon svg {
  width: 18px;
  height: 18px;
}


/* =========================================================
   OPTIONS CARD — segmented + checkboxes
======================================================== */

.exp-fieldset {
  margin: 0;
  padding: 0;

  border: none;
}

.exp-fieldset legend {
  margin-bottom: 6px;

  padding: 0;
}

.exp-checks {
  display: flex;
  flex-wrap: wrap;

  gap: 8px;
}

.exp-check {
  display: inline-flex;
  align-items: center;

  gap: 8px;

  margin-bottom: 0;

  padding: 9px 12px;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card);

  color: var(--text-muted);

  font-size: 10px;
  font-weight: 800;

  letter-spacing: 0.6px;

  cursor: pointer;

  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.exp-check:hover {
  background: var(--bg-hover);

  border-color: var(--border-strong);
}

.exp-check input {
  width: 14px;
  height: 14px;

  margin: 0;

  accent-color: var(--accent);

  cursor: pointer;
}

.exp-check:has(input:checked) {
  border-color: var(--accent-border);

  background: var(--accent-soft);

  color: var(--accent-text);
}

.exp-check.is-locked {
  cursor: default;

  opacity: 0.8;
}

.exp-check.is-locked:hover {
  background: var(--bg-card);

  border-color: var(--border);
}

.exp-check.is-locked input {
  cursor: not-allowed;
}

.field-hint + .setting-row {
  margin-top: 4px;
}


/* =========================================================
   EXPORT ACTIONS
======================================================== */

.exp-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  gap: 10px 12px;

  margin-top: 22px;
  padding-top: 18px;

  border-top: 1px solid var(--border);
}

.exp-actions .primary-button {
  gap: 8px;

  min-height: 40px;

  padding: 0 17px;
}

.exp-actions .primary-button svg {
  width: 15px;
  height: 15px;

  flex-shrink: 0;
}

.exp-empty-hint {
  margin-top: 0;
}


/* Disabled affordance while exporting / nothing to do */

.export-page button.primary-button:disabled {
  opacity: 0.55;

  cursor: not-allowed;

  transform: none;

  box-shadow: none;
}


/* =========================================================
   PROGRESS (track + accent gradient fill)
======================================================== */

.exp-progress {
  margin-top: 16px;
}

.exp-track {
  height: 12px;

  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 999px;

  background: var(--bg-inset);
}

.exp-bar {
  height: 100%;

  border-radius: 999px;

  background:
    linear-gradient(
      90deg,
      var(--accent),
      var(--accent-alt)
    );

  transition: width 0.3s ease;
}

.exp-status {
  margin: 10px 0 0;

  color: var(--text-secondary);

  font-size: 12px;
  font-weight: 700;
}


/* =========================================================
   DONE CHIP — “Exported” confirmation
======================================================== */

.exp-done {
  display: flex;
  align-items: center;

  gap: 11px;

  margin-top: 16px;
  padding: 12px 14px;

  border: 1px solid var(--success-border);
  border-radius: 12px;

  background: var(--success-soft);
}

.exp-done-icon {
  width: 32px;
  height: 32px;

  display: grid;
  place-items: center;

  flex-shrink: 0;

  border-radius: 9px;

  background: var(--bg-card);

  color: var(--success-text);
}

.exp-done-icon svg {
  width: 17px;
  height: 17px;
}

.exp-done-text {
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.exp-done-text strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: var(--success-text);

  font-size: 12px;
  font-weight: 800;
}

.exp-done-text span {
  margin-top: 2px;

  color: var(--text-muted);

  font-size: 10.5px;
}


/* =========================================================
   ERROR BLOCK INSIDE THE OPTIONS CARD
======================================================== */

.exp-error {
  min-height: 0;

  margin-top: 18px;

  padding: 24px;
}


/*
 * Keep the shared .empty-icon but recolour it for
 * the tinted error panel (tokens only).
 */
.exp-state-icon {
  background: var(--bg-card);

  border: 1px solid var(--danger-border);

  color: var(--danger-text);
}

.message.error .empty-icon {
  background: var(--bg-card);

  border: 1px solid var(--danger-border);

  color: var(--danger-text);
}


/* =========================================================
   ICON TILES — inline SVG sizing
======================================================== */

.empty-icon svg {
  width: 24px;
  height: 24px;
}


/* =========================================================
   RESPONSIVE — one column below ~720px
======================================================== */

@media (max-width: 720px) {
  .export-grid {
    grid-template-columns:
      minmax(0, 1fr);
  }

  .setting-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .segmented {
    width: 100%;
  }

  .segmented button {
    flex: 1;
  }

  .exp-actions .primary-button {
    width: 100%;
  }
}
</style>
