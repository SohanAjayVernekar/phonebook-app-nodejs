<template>
  <section class="import-page">

    <!-- =====================================================
         PAGE HEADING
    ====================================================== -->

    <div class="dashboard-heading">

      <div>
        <span class="section-label">
          IMPORT
        </span>

        <h1>
          Import contacts
        </h1>

        <p>
          Paste CSV or drop a file — we&apos;ll add
          everyone in one go.
        </p>
      </div>


      <div class="dashboard-date">
        <span>
          STEP
        </span>

        <strong>
          {{ stepNumber }} of 4
        </strong>
      </div>

    </div>


    <!-- =====================================================
         STEP RAIL — where am I in the flow?
    ====================================================== -->

    <ol
      class="imp-rail"
      aria-label="Import steps"
    >
      <li
        v-for="(label, index) in STEP_LABELS"
        :key="label"
        class="imp-step"
        :class="{
          'is-active': index + 1 === stepNumber,
          'is-done': index + 1 < stepNumber,
        }"
        :aria-current="
          index + 1 === stepNumber ? 'step' : undefined
        "
      >
        <span
          class="imp-step-index"
          aria-hidden="true"
        >
          {{ index + 1 }}
        </span>

        {{ label }}
      </li>
    </ol>


    <!-- =====================================================
         STEP 1 — SOURCE (file drop or pasted CSV)
    ====================================================== -->

    <section
      v-if="step === 'empty'"
      class="import-panel"
      aria-labelledby="import-source-title"
    >

      <div class="imp-panel-head">
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
            <path :d="ICONS.import" />
          </svg>
        </span>

        <div>
          <h2 id="import-source-title">
            Choose your source
          </h2>

          <p>
            Upload a CSV file or paste rows straight
            from a spreadsheet.
          </p>
        </div>
      </div>


      <div class="source-grid">


        <!-- ============================
             A) DROP ZONE
        ============================= -->

        <div class="source-block">
          <span class="field-label">
            Upload a file
          </span>

          <div
            class="drop-zone"
            :class="{ 'is-dragover': isDragOver }"
            role="button"
            tabindex="0"
            @click="openFilePicker"
            @keydown.enter.prevent="openFilePicker"
            @keydown.space.prevent="openFilePicker"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
          >
            <span
              class="drop-icon"
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
                <path :d="ICONS.import" />
              </svg>
            </span>

            <strong class="drop-title">
              Drop a CSV file here
            </strong>

            <span class="drop-hint">
              or click to browse — plain
              <code>.csv</code> files
            </span>
          </div>


          <!-- Chosen file summary + Remove -->

          <div
            v-if="fileName"
            class="file-meta"
          >
            <div class="file-meta-text">
              <strong
                class="file-name"
                :title="fileName"
              >
                {{ fileName }}
              </strong>

              <span class="file-size">
                {{ formatBytes(fileSize) }}
              </span>
            </div>

            <button
              type="button"
              class="secondary-button imp-remove"
              @click="removeFile"
            >
              Remove
            </button>
          </div>


          <!-- Hidden picker (opened by the zone) -->

          <input
            ref="fileInput"
            type="file"
            accept=".csv,text/csv"
            class="imp-file"
            @change="onFileSelected"
          />
        </div>


        <!-- ============================
             B) PASTE TEXTAREA
        ============================= -->

        <div class="source-block">
          <label
            class="field-label"
            for="csv-paste"
          >
            Paste CSV
          </label>

          <textarea
            id="csv-paste"
            v-model="sourceText"
            class="csv-textarea"
            rows="9"
            spellcheck="false"
            placeholder="name,phone_number,email,category,address"
            @input="onPasteInput"
          ></textarea>

          <small class="field-hint">
            Header row expected: name, phone_number,
            email, category, address
          </small>
        </div>

      </div>


      <!-- Parse problems stay inline so the page
           never goes blank while you fix them -->

      <p
        v-if="parseError"
        class="form-error"
        role="alert"
      >
        {{ parseError }}
      </p>


      <div class="imp-actions">
        <button
          type="button"
          class="secondary-button"
          @click="downloadTemplate"
        >
          Download template
        </button>

        <button
          type="button"
          class="primary-button"
          :disabled="!hasSource || parsing"
          @click="previewSource"
        >
          {{ parsing ? "Parsing…" : "Preview import" }}
        </button>
      </div>

    </section>


    <!-- =====================================================
         STEP 2 — PREVIEW (chips · table · issues)
    ====================================================== -->

    <section
      v-else-if="step === 'preview'"
      class="import-panel"
      aria-labelledby="import-preview-title"
    >

      <div class="imp-panel-head">
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
            <path :d="ICONS.info" />
          </svg>
        </span>

        <div>
          <h2 id="import-preview-title">
            Review your rows
          </h2>

          <p>
            Nothing is saved yet — check the first
            few rows before you continue.
          </p>
        </div>


        <!-- Summary chips: N valid · M issues -->

        <div class="imp-chips">
          <span class="imp-chip is-valid">
            <i
              class="imp-dot ok"
              aria-hidden="true"
            ></i>
            {{ validCount }} valid
          </span>

          <span
            v-if="issueCount > 0"
            class="imp-chip is-issue"
          >
            <i
              class="imp-dot bad"
              aria-hidden="true"
            ></i>
            {{ issueCount }}
            {{ issueCount === 1 ? "issue" : "issues" }}
          </span>
        </div>
      </div>


      <!-- Empty guard — never a blank panel -->

      <div
        v-if="rows.length === 0"
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
            <path :d="ICONS.alertTriangle" />
          </svg>
        </span>

        <h2>Nothing to import</h2>

        <p>
          We couldn&apos;t find any rows in that
          source. Grab the template and try again.
        </p>

        <button
          type="button"
          class="primary-button"
          @click="resetAll"
        >
          Start from scratch
        </button>
      </div>


      <!-- Preview table (first 8 rows) -->

      <div
        v-else
        class="imp-table-wrap"
      >
        <table class="imp-table">
          <caption class="imp-table-caption">
            Showing {{ previewRows.length }} of
            {{ rows.length }} parsed rows
          </caption>

          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Phone</th>
              <th scope="col">Email</th>
              <th scope="col">Category</th>
              <th scope="col">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="row in previewRows"
              :key="row.line"
              :class="{ 'is-invalid': !row.valid }"
            >
              <td class="imp-cell-index">
                {{ row.line }}
              </td>

              <td>
                <span
                  v-if="row.display.name"
                  class="table-name cell-text"
                >
                  {{ row.display.name }}
                </span>

                <span
                  v-else
                  class="cell-empty"
                >
                  —
                </span>
              </td>

              <td>
                <span
                  v-if="row.display.phone"
                  class="table-phone cell-text"
                >
                  {{ row.display.phone }}
                </span>

                <span
                  v-else
                  class="cell-empty"
                >
                  —
                </span>
              </td>

              <td>
                <span
                  v-if="row.display.email"
                  class="table-email cell-text"
                >
                  {{ row.display.email }}
                </span>

                <span
                  v-else
                  class="cell-empty"
                >
                  —
                </span>
              </td>

              <td>
                <span
                  v-if="row.display.category"
                  class="contact-category"
                  :class="categoryClass(row.display.category)"
                >
                  {{ row.display.category }}
                </span>

                <span
                  v-else
                  class="cell-empty"
                >
                  —
                </span>
              </td>

              <td>
                <span class="imp-status-cell">
                  <i
                    class="imp-dot"
                    :class="row.valid ? 'ok' : 'bad'"
                    aria-hidden="true"
                  ></i>

                  <span
                    v-if="row.valid"
                    class="imp-ready"
                  >
                    Ready
                  </span>

                  <span
                    v-else
                    class="imp-reason"
                  >
                    {{ row.reason }}
                  </span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>


      <!-- Collapsible issues list -->

      <button
        v-if="issueCount > 0 && rows.length > 0"
        type="button"
        class="filter-toggle imp-issues-toggle"
        :class="{ active: showIssues }"
        :aria-expanded="showIssues"
        aria-controls="imp-issues"
        @click="showIssues = !showIssues"
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
          <path :d="ICONS.chevronRight" />
        </svg>

        {{
          showIssues
            ? "Hide issues"
            : `Show ${issueCount} ${
                issueCount === 1 ? "issue" : "issues"
              } to fix`
        }}
      </button>

      <ul
        v-show="showIssues"
        id="imp-issues"
        class="imp-issues"
      >
        <li
          v-for="row in issueRows"
          :key="row.line"
        >
          <span class="imp-issue-row">
            Row {{ row.line }}
          </span>

          <span class="imp-issue-name">
            {{
              row.display.name ||
              row.display.phone ||
              "Unnamed row"
            }}
          </span>

          <span class="imp-issue-reason">
            {{ row.reason }}
          </span>
        </li>
      </ul>


      <!-- All rows broken → the primary action
           stays disabled, with an explanation -->

      <p
        v-if="validCount === 0 && rows.length > 0"
        class="form-error"
        role="alert"
      >
        No valid rows yet — fix the issues above to
        continue.
      </p>


      <div class="imp-actions">
        <button
          type="button"
          class="secondary-button"
          @click="startOver"
        >
          Start over
        </button>

        <button
          type="button"
          class="primary-button"
          :disabled="validCount === 0"
          @click="runImport"
        >
          Import {{ validCount }}
          {{ validCount === 1 ? "contact" : "contacts" }}
        </button>
      </div>

    </section>


    <!-- =====================================================
         STEP 3 — IMPORTING (live progress)
    ====================================================== -->

    <section
      v-else-if="step === 'importing'"
      class="import-panel"
      aria-labelledby="import-progress-title"
    >

      <div class="imp-panel-head">
        <span class="settings-icon blue">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path :d="ICONS.activity" />
          </svg>
        </span>

        <div>
          <h2 id="import-progress-title">
            Importing your contacts
          </h2>

          <p>
            Keep this tab open — rows are saved a few
            at a time so nothing gets dropped.
          </p>
        </div>
      </div>


      <div class="imp-progress">
        <div
          class="imp-track"
          role="progressbar"
          aria-label="Import progress"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="progressPercent"
        >
          <div
            class="imp-bar"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>

        <div class="imp-progress-meta">
          <p
            class="imp-status"
            aria-live="polite"
          >
            {{ doneCount }} of {{ totalCount }}
          </p>

          <p
            class="imp-status imp-status-fails"
            :class="{ 'has-fails': failCount > 0 }"
            aria-live="polite"
          >
            {{ failCount }}
            {{ failCount === 1 ? "row failed" : "rows failed" }}
          </p>
        </div>
      </div>

    </section>


    <!-- =====================================================
         STEP 4 — DONE (success summary)
    ====================================================== -->

    <section
      v-else
      class="message"
      aria-live="polite"
    >
      <span
        class="imp-done-icon"
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

      <h2>
        {{ importedCount }}
        {{ importedCount === 1 ? "contact" : "contacts" }}
        imported
      </h2>

      <p v-if="failCount > 0">
        {{ failCount }}
        {{
          failCount === 1
            ? "row couldn't be saved"
            : "rows couldn't be saved"
        }}
        . Fix those lines and run another import.
      </p>

      <p v-else>
        Every row in your file is now in your
        address book.
      </p>


      <div class="imp-actions imp-actions-centered">
        <router-link
          to="/contacts"
          class="primary-button"
        >
          View contacts
        </router-link>

        <button
          type="button"
          class="secondary-button"
          @click="resetAll"
        >
          Import another file
        </button>
      </div>

    </section>

  </section>
</template>


<script setup>
import {
  computed,
  ref,
} from "vue";

import { ICONS } from "../icons";

import api from "../services/api";

import {
  toast,
  confirmAction,
} from "../services/ui";

import {
  useContactStore,
} from "../stores/contactStore";


/* =========================================================
   STORE
========================================================== */

const contactStore = useContactStore();


/* =========================================================
   CONSTANTS — server contract (ContactRequest)
   ---------------------------------------------------------
   POST /contacts body: name, phone_number, email,
   address, category. name + phone_number are required,
   phone must match ^\+?[1-9]\d{6,19}$, category must be
   WORK / FAMILY / FRIEND (null is allowed → FRIEND).
========================================================== */

const STEPS = {
  SOURCE: "empty",
  PREVIEW: "preview",
  IMPORTING: "importing",
  DONE: "done",
};

const STEP_LABELS = [
  "Source",
  "Preview",
  "Importing",
  "Done",
];

const VALID_CATEGORIES = [
  "WORK",
  "FAMILY",
  "FRIEND",
];

const PHONE_PATTERN = /^\+?[1-9]\d{6,19}$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Rows are POSTed in small chunks — never 500 at once. */
const IMPORT_CHUNK_SIZE = 5;

const TEMPLATE_CSV =
  "name,phone_number,email,category,address\r\n" +
  'Ada Lovelace,+14155552671,ada@example.com,WORK,"12 St James Square, London"\r\n' +
  'Grace Hopper,15555550102,grace.hopper@example.com,FRIEND,"Arlington, VA"\r\n';


/* =========================================================
   STATE — multi-step flow
========================================================== */

const step = ref(STEPS.SOURCE);

const stepNumber = computed(() => {
  const map = {
    [STEPS.SOURCE]: 1,
    [STEPS.PREVIEW]: 2,
    [STEPS.IMPORTING]: 3,
    [STEPS.DONE]: 4,
  };

  return map[step.value] ?? 1;
});


/* ---------- step 1: source ---------- */

const sourceText = ref("");

const fileName = ref("");

const fileSize = ref(0);

const isDragOver = ref(false);

const parsing = ref(false);

const parseError = ref("");

const fileInput = ref(null);


const hasSource = computed(() => {
  return sourceText.value.trim().length > 0;
});


/* ---------- step 2: preview ---------- */

const rows = ref([]);

const showIssues = ref(false);


const previewRows = computed(() => {
  return rows.value.slice(0, 8);
});


const validCount = computed(() => {
  return rows.value.filter((row) => row.valid).length;
});


const issueRows = computed(() => {
  return rows.value.filter((row) => !row.valid);
});


const issueCount = computed(() => {
  return issueRows.value.length;
});


/* ---------- step 3: importing ---------- */

const totalCount = ref(0);

const doneCount = ref(0);

const successCount = ref(0);

const failCount = ref(0);

const failures = ref([]);


const progressPercent = computed(() => {
  if (totalCount.value === 0) {
    return 0;
  }

  return Math.round(
    (doneCount.value / totalCount.value) * 100
  );
});


/* ---------- step 4: done ---------- */

const importedCount = ref(0);


/* =========================================================
   ERROR HELPER
   ---------------------------------------------------------
   The backend reports failures as { detail: "…" }.
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
   FILE SIZE HELPER
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


/* =========================================================
   FILE PICKER / DRAG & DROP
========================================================== */

const openFilePicker = () => {
  fileInput.value?.click();
};


const looksLikeCsv = (file) => {
  return (
    /\.csv$/i.test(file.name) ||
    file.type === "text/csv" ||
    file.type === "application/vnd.ms-excel"
  );
};


const readFile = (file) => {
  if (!looksLikeCsv(file)) {
    toast(
      "error",
      "Unsupported file",
      "Choose a .csv file to import."
    );
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    /* Strip a UTF-8 BOM so the header maps cleanly. */
    sourceText.value = String(reader.result || "")
      .replace(/^\uFEFF/, "");

    fileName.value = file.name;
    fileSize.value = file.size;
    parseError.value = "";
  };

  reader.onerror = () => {
    toast(
      "error",
      "Couldn't read that file",
      "Drop it again or paste the rows instead."
    );
  };

  reader.readAsText(file);
};


const onFileSelected = (event) => {
  const file = event.target.files?.[0];

  if (file) {
    readFile(file);
  }

  /* Allow re-picking the same file later. */
  event.target.value = "";
};


const onDragOver = () => {
  isDragOver.value = true;
};


const onDragLeave = (event) => {
  /* Ignore moves between the zone's children. */
  if (event.currentTarget.contains(event.relatedTarget)) {
    return;
  }

  isDragOver.value = false;
};


const onDrop = (event) => {
  isDragOver.value = false;

  const file = event.dataTransfer?.files?.[0];

  if (file) {
    readFile(file);
  }
};


const removeFile = () => {
  sourceText.value = "";
  fileName.value = "";
  fileSize.value = 0;
  parseError.value = "";

  if (fileInput.value) {
    fileInput.value.value = "";
  }
};


/*
 * Typing by hand means the text no longer
 * belongs to the uploaded file.
 */
const onPasteInput = () => {
  fileName.value = "";
  fileSize.value = 0;
};


/* =========================================================
   TEMPLATE DOWNLOAD (client-side Blob)
========================================================== */

const downloadTemplate = () => {
  const blob = new Blob([TEMPLATE_CSV], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "connect-import-template.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  /* Release the object URL right after the click. */
  setTimeout(() => URL.revokeObjectURL(url), 0);

  toast(
    "success",
    "Template downloaded",
    "Fill it in, then drop it back here."
  );
};


/* =========================================================
   CSV PARSER (RFC-style: quotes, CRLF, blank lines)
========================================================== */

const parseCsv = (text) => {
  const records = [];

  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        /* "" → a literal quote inside the field */
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }

      continue;
    }

    if (char === '"' && field === "") {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      records.push(row);

      row = [];
      field = "";
    } else if (char === "\r") {
      /* CRLF (and lone CR) end the record */
      if (text[i + 1] === "\n") {
        i += 1;
      }

      row.push(field);
      records.push(row);

      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  /* Flush whatever is still buffered. */
  if (field !== "" || row.length > 0) {
    row.push(field);
    records.push(row);
  }

  return records;
};


/* Header aliases — case/space/punctuation insensitive. */

const normalizeKey = (value) => {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};


const HEADER_ALIASES = {
  name: [
    "name",
    "fullname",
    "contactname",
    "contact",
  ],
  phone: [
    "phone",
    "phonenumber",
    "mobile",
    "mobilenumber",
    "telephone",
    "tel",
  ],
  email: [
    "email",
    "emailaddress",
    "mail",
  ],
  category: [
    "category",
    "group",
    "tag",
  ],
  address: [
    "address",
    "street",
    "location",
  ],
};


const resolveHeader = (headerCells) => {
  const map = {
    name: -1,
    phone: -1,
    email: -1,
    category: -1,
    address: -1,
  };

  headerCells.forEach((cell, index) => {
    const key = normalizeKey(cell);

    Object.keys(HEADER_ALIASES).forEach((field) => {
      if (
        map[field] === -1 &&
        HEADER_ALIASES[field].includes(key)
      ) {
        map[field] = index;
      }
    });
  });

  return map;
};


/*
 * Phones typed as "090 1234 5678" are cleaned up
 * before they hit the strict server regex.
 */
const normalizePhone = (value) => {
  return String(value || "").replace(/[\s\-().]/g, "");
};


const normalizeCategory = (value) => {
  const raw = String(value || "").trim();

  if (!raw) {
    return "";
  }

  const upper = raw.toUpperCase();

  return VALID_CATEGORIES.includes(upper)
    ? upper
    : "";
};


/* =========================================================
   ROW VALIDATION — mirrors ContactRequest.validate()
========================================================== */

const buildRow = (cells, line, map) => {
  const get = (index) => {
    if (index < 0 || cells[index] === undefined) {
      return "";
    }

    return String(cells[index]).trim();
  };

  const name = get(map.name);
  const rawPhone = get(map.phone);
  const phone = normalizePhone(rawPhone);
  const email = get(map.email);
  const address = get(map.address);
  const category = normalizeCategory(get(map.category));


  /* ---------- validation ---------- */

  let valid = true;
  let reason = "";

  if (!name && !rawPhone) {
    valid = false;
    reason = "Missing name and phone number";
  } else if (!name) {
    valid = false;
    reason = "Name is required";
  } else if (!rawPhone) {
    valid = false;
    reason = "Phone number is required";
  } else if (!PHONE_PATTERN.test(phone)) {
    valid = false;
    reason =
      "Phone must be 7–20 digits and may start with +";
  } else if (email && !EMAIL_PATTERN.test(email)) {
    valid = false;
    reason = "Email address doesn't look valid";
  }


  return {
    line,
    valid,
    reason,
    display: {
      name,
      phone: phone || rawPhone,
      email,
      category,
    },
    payload: {
      name,
      phone_number: phone,
      email: email || null,
      address: address || null,
      category: category || null,
    },
  };
};


/* =========================================================
   PARSING — source text → preview rows
========================================================== */

const buildRows = (text) => {
  const records = parseCsv(text);

  /* Keep original record positions for error display. */
  const nonBlank = records
    .map((cells, index) => ({ cells, index }))
    .filter((record) =>
      record.cells.some(
        (cell) => cell.trim() !== ""
      )
    );

  if (nonBlank.length === 0) {
    throw new Error(
      "That source is empty — add some rows first."
    );
  }

  const header = nonBlank[0];
  const map = resolveHeader(header.cells);

  if (map.name === -1 && map.phone === -1) {
    throw new Error(
      "We couldn't find a name or phone column. " +
      "Check that your CSV starts with a header row."
    );
  }

  return nonBlank
    .slice(1)
    .map((record) =>
      buildRow(
        record.cells,
        record.index + 1,
        map
      )
    );
};


const previewSource = async () => {
  parseError.value = "";

  const text = sourceText.value.trim();

  if (!text) {
    parseError.value =
      "Add a CSV file or paste some rows first.";
    return;
  }

  parsing.value = true;

  /* Yield once so the button really renders its
     disabled “Parsing…” state before we work. */
  await new Promise((resolve) =>
    setTimeout(resolve, 40)
  );

  try {
    const parsed = buildRows(text);

    rows.value = parsed;
    showIssues.value = false;
    step.value = STEPS.PREVIEW;

    if (parsed.length === 0) {
      toast(
        "warning",
        "No rows found",
        "The file had a header but no data rows."
      );
    } else if (
      parsed.every((row) => !row.valid)
    ) {
      toast(
        "warning",
        "Nothing is importable yet",
        "Every row needs a fix before importing."
      );
    }
  } catch (error) {
    parseError.value =
      error?.message || "We couldn't read that CSV.";

    toast(
      "error",
      "Couldn't read the CSV",
      parseError.value
    );
  } finally {
    parsing.value = false;
  }
};


/* =========================================================
   CATEGORY CHIP CLASS (reuses the global chips)
========================================================== */

const categoryClass = (category) => {
  return `category-${String(category).toLowerCase()}`;
};


/* =========================================================
   START OVER (guarded — keeps accidental clicks safe)
========================================================== */

const resetAll = () => {
  step.value = STEPS.SOURCE;
  sourceText.value = "";
  fileName.value = "";
  fileSize.value = 0;
  isDragOver.value = false;
  parsing.value = false;
  parseError.value = "";
  rows.value = [];
  showIssues.value = false;
  totalCount.value = 0;
  doneCount.value = 0;
  successCount.value = 0;
  failCount.value = 0;
  failures.value = [];
  importedCount.value = 0;

  if (fileInput.value) {
    fileInput.value.value = "";
  }
};


const startOver = async () => {
  const hasWork =
    sourceText.value.trim() !== "" ||
    rows.value.length > 0;

  if (hasWork) {
    const confirmed = await confirmAction({
      title: "Start over?",
      message:
        "Your chosen file and parsed preview will be cleared.",
      confirmText: "Start over",
      cancelText: "Keep editing",
      danger: false,
    });

    if (!confirmed) {
      return;
    }
  }

  resetAll();
};


/* =========================================================
   IMPORT — sequential chunks of POST /contacts
========================================================== */

const runImport = async () => {
  const targets = rows.value.filter(
    (row) => row.valid
  );

  if (targets.length === 0) {
    return;
  }

  step.value = STEPS.IMPORTING;

  totalCount.value = targets.length;
  doneCount.value = 0;
  successCount.value = 0;
  failCount.value = 0;
  failures.value = [];


  for (
    let index = 0;
    index < targets.length;
    index += IMPORT_CHUNK_SIZE
  ) {
    const chunk = targets.slice(
      index,
      index + IMPORT_CHUNK_SIZE
    );

    /*
     * Five requests in flight at a time; a failed
     * row is recorded but never stops the batch.
     */
    await Promise.all(
      chunk.map(async (row) => {
        try {
          await api.post("/contacts", row.payload);
          successCount.value += 1;
        } catch (error) {
          failCount.value += 1;

          failures.value.push({
            line: row.line,
            message: extractError(
              error,
              "The server rejected this row."
            ),
          });
        } finally {
          doneCount.value += 1;
        }
      })
    );
  }


  importedCount.value = successCount.value;
  step.value = STEPS.DONE;


  /* Refresh the shared list so /contacts is current. */
  try {
    await contactStore.loadContacts();
  } catch {
    /* non-fatal — the list reloads on its own page */
  }


  /* ---------- toast: success / warning / error ---------- */

  const firstFailure = failures.value[0];

  const failureNote = firstFailure
    ? ` First problem (row ${firstFailure.line}): ${firstFailure.message}.`
    : "";

  if (
    successCount.value > 0 &&
    failCount.value === 0
  ) {
    toast(
      "success",
      "Import complete",
      `${successCount.value} ${
        successCount.value === 1
          ? "contact was"
          : "contacts were"
      } added to your address book.`
    );
  } else if (successCount.value > 0) {
    toast(
      "warning",
      "Import finished with issues",
      `${successCount.value} added, ` +
      `${failCount.value} failed.${failureNote}`
    );
  } else {
    toast(
      "error",
      "Import failed",
      `None of the ${totalCount.value} rows could be saved.${failureNote}`
    );
  }
};

</script>


<style scoped>
/* =========================================================
   PAGE SHELL
======================================================== */

.import-page {
  width: 100%;
}


/* =========================================================
   STEP RAIL
======================================================== */

.imp-rail {
  display: flex;
  flex-wrap: wrap;

  gap: 8px;

  margin: 0 0 18px;
  padding: 0;

  list-style: none;
}

.imp-step {
  display: inline-flex;
  align-items: center;

  gap: 8px;

  padding: 7px 13px;

  border: 1px solid var(--border);
  border-radius: 999px;

  background: var(--bg-card);

  color: var(--text-muted);

  font-size: 10px;
  font-weight: 800;

  letter-spacing: 0.4px;
}

.imp-step.is-active {
  border-color: var(--accent-border);

  background: var(--accent-soft);

  color: var(--accent-text);
}

.imp-step.is-done {
  border-color: var(--success-border);

  background: var(--success-soft);

  color: var(--success-text);
}

.imp-step-index {
  width: 16px;
  height: 16px;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background: var(--bg-inset);

  color: var(--text-faint);

  font-size: 9px;
  font-weight: 850;
}

.imp-step.is-active .imp-step-index {
  background: var(--accent);

  color: var(--text-on-accent);
}

.imp-step.is-done .imp-step-index {
  background: var(--success);

  color: var(--text-on-accent);
}


/* =========================================================
   PANEL (glass card per step)
======================================================== */

.import-panel {
  padding: 26px;

  border: 1px solid var(--border-glass);
  border-radius: 22px;

  background: var(--bg-glass);

  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);

  box-shadow:
    0 14px 40px rgba(var(--shadow-rgb), 0.07);
}

.imp-panel-head {
  display: flex;
  align-items: center;

  gap: 13px;

  margin-bottom: 20px;
  padding-bottom: 17px;

  border-bottom: 1px solid var(--border);
}

.imp-panel-head h2 {
  margin: 0;

  color: var(--text-primary);

  font-size: 16px;
  font-weight: 850;

  letter-spacing: -0.2px;
}

.imp-panel-head p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 11px;

  line-height: 1.5;
}

.imp-panel-head .settings-icon svg {
  width: 18px;
  height: 18px;
}


/* =========================================================
   STEP 1 — SOURCE GRID
======================================================== */

.source-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 20px;
}

.source-block {
  min-width: 0;

  display: flex;
  flex-direction: column;
}


/* ---------- drop zone ---------- */

.drop-zone {
  flex: 1;

  min-height: 190px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 10px;

  padding: 24px;

  text-align: center;

  border: 2px dashed var(--border-strong);
  border-radius: 16px;

  background: var(--bg-inset);

  cursor: pointer;

  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.drop-zone:hover,
.drop-zone:focus-visible {
  border-color: var(--accent-border);

  background: var(--bg-card);

  transform: translateY(-2px);
}

.drop-zone.is-dragover {
  border-color: var(--accent);

  background: var(--accent-soft);
}

.drop-icon {
  width: 48px;
  height: 48px;

  display: grid;
  place-items: center;

  border-radius: 14px;

  background: var(--accent-soft);

  color: var(--accent-text);
}

.drop-icon svg {
  width: 22px;
  height: 22px;
}

.drop-title {
  color: var(--text-primary);

  font-size: 13px;
  font-weight: 800;
}

.drop-hint {
  color: var(--text-faint);

  font-size: 10.5px;

  line-height: 1.5;
}

.drop-hint code {
  padding: 1px 5px;

  border: 1px solid var(--border);
  border-radius: 5px;

  background: var(--bg-card);

  color: var(--text-secondary);

  font-size: 10px;
}


/* ---------- chosen file summary ---------- */

.file-meta {
  display: flex;
  align-items: center;

  gap: 12px;

  margin-top: 10px;
  padding: 10px 13px;

  border: 1px solid var(--border);
  border-radius: 12px;

  background: var(--bg-inset);
}

.file-meta-text {
  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: var(--text-primary);

  font-size: 12px;
  font-weight: 750;
}

.file-size {
  margin-top: 2px;

  color: var(--text-faint);

  font-size: 10px;
}


/* ---------- hidden file input ---------- */

.imp-file {
  display: none;
}


/* =========================================================
   STEP 1 — PASTE TEXTAREA (mirrors global inputs)
======================================================== */

.csv-textarea {
  width: 100%;
  min-height: 190px;

  padding: 13px 15px;

  box-sizing: border-box;

  border: 1px solid var(--border-input);
  border-radius: 12px;

  outline: none;

  background: var(--bg-input);

  color: var(--text-primary);

  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;

  font-size: 12px;

  line-height: 1.6;

  resize: vertical;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.csv-textarea::placeholder {
  color: var(--text-faint);
}

.csv-textarea:focus {
  border-color: var(--focus-border);

  box-shadow:
    0 0 0 4px rgba(var(--focus-rgb), 0.25);
}


/* =========================================================
   SUMMARY CHIPS (preview)
======================================================== */

.imp-chips {
  display: flex;
  flex-wrap: wrap;

  gap: 8px;

  margin-left: auto;
}

.imp-chip {
  display: inline-flex;
  align-items: center;

  gap: 7px;

  padding: 7px 12px;

  border: 1px solid var(--border);
  border-radius: 999px;

  background: var(--bg-card);

  color: var(--text-muted);

  font-size: 10px;
  font-weight: 800;
}

.imp-chip.is-valid {
  border-color: var(--success-border);

  background: var(--success-soft);

  color: var(--success-text);
}

.imp-chip.is-issue {
  border-color: var(--danger-border);

  background: var(--danger-soft);

  color: var(--danger-text);
}


/* ---------- status dots ---------- */

.imp-dot {
  width: 7px;
  height: 7px;

  flex-shrink: 0;

  border-radius: 50%;
}

.imp-dot.ok {
  background: var(--success);

  box-shadow:
    0 0 0 3px rgba(var(--success-rgb), 0.14);
}

.imp-dot.bad {
  background: var(--danger);

  box-shadow:
    0 0 0 3px rgba(var(--danger-rgb), 0.14);
}


/* =========================================================
   PREVIEW TABLE
======================================================== */

.imp-table-wrap {
  width: 100%;

  overflow-x: auto;

  border: 1px solid var(--border);
  border-radius: 15px;

  background: var(--bg-card);

  box-shadow:
    0 6px 20px rgba(var(--shadow-rgb), 0.04);
}

.imp-table {
  width: 100%;
  min-width: 660px;

  border-collapse: separate;
  border-spacing: 0;
}

.imp-table-caption {
  padding: 10px 15px;

  text-align: left;

  border-bottom: 1px solid var(--border);

  background: var(--bg-inset);

  color: var(--text-faint);

  font-size: 10px;
  font-weight: 700;
}

.imp-table thead th {
  height: 40px;

  padding: 0 15px;

  border-bottom: 1px solid var(--border);

  background: var(--bg-inset);

  color: var(--text-faint);

  font-size: 9px;
  font-weight: 850;

  letter-spacing: 1.1px;
  text-transform: uppercase;

  text-align: left;

  white-space: nowrap;
}

.imp-table tbody td {
  height: 58px;

  padding: 10px 15px;

  border-bottom: 1px solid var(--border);

  background: var(--bg-card);

  color: var(--text-secondary);

  font-size: 12px;

  vertical-align: middle;
}

.imp-table tbody tr:last-child td {
  border-bottom: none;
}

.imp-table tbody tr:hover td {
  background: var(--bg-hover);
}

.imp-table tbody tr.is-invalid td {
  background: var(--danger-soft);
}

.imp-cell-index {
  color: var(--text-faint);

  font-size: 11px;
  font-weight: 800;

  font-variant-numeric: tabular-nums;
}

/* Reused global category chip keeps its own
   bottom margin off inside the cells. */
.imp-table .contact-category {
  margin-bottom: 0;
}


/* ---------- status cell ---------- */

.imp-status-cell {
  display: inline-flex;
  align-items: center;

  gap: 7px;

  min-width: 0;
}

.imp-ready {
  color: var(--success-text);

  font-size: 11px;
  font-weight: 750;
}

.imp-reason {
  color: var(--danger-text);

  font-size: 11px;

  line-height: 1.4;
}


/* =========================================================
   ISSUES (collapsible)
======================================================== */

.imp-issues-toggle {
  margin-top: 16px;
}

.imp-issues-toggle svg {
  width: 14px;
  height: 14px;

  transition: transform 0.18s ease;
}

.imp-issues-toggle.active svg {
  transform: rotate(90deg);
}

.imp-issues {
  display: flex;
  flex-direction: column;

  gap: 8px;

  margin: 12px 0 0;
  padding: 0;

  list-style: none;
}

.imp-issues li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;

  gap: 10px;

  padding: 10px 13px;

  border: 1px solid var(--danger-border);
  border-radius: 10px;

  background: var(--danger-soft);
}

.imp-issue-row {
  color: var(--danger-text);

  font-size: 10px;
  font-weight: 850;

  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.imp-issue-name {
  color: var(--text-secondary);

  font-size: 12px;
  font-weight: 700;

  overflow-wrap: anywhere;
}

.imp-issue-reason {
  margin-left: auto;

  color: var(--danger-text);

  font-size: 11px;
}


/* =========================================================
   STEP 3 — PROGRESS
======================================================== */

.imp-progress {
  padding: 8px 0 4px;
}

.imp-track {
  height: 12px;

  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 999px;

  background: var(--bg-inset);
}

.imp-bar {
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

.imp-progress-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  margin-top: 10px;
}

.imp-status {
  margin: 0;

  color: var(--text-secondary);

  font-size: 12px;
  font-weight: 750;

  font-variant-numeric: tabular-nums;
}

.imp-status-fails {
  color: var(--text-muted);

  font-weight: 650;
}

.imp-status-fails.has-fails {
  color: var(--danger-text);

  font-weight: 750;
}


/* =========================================================
   STEP 4 — DONE
======================================================== */

.imp-done-icon {
  width: 64px;
  height: 64px;

  display: grid;
  place-items: center;

  margin-bottom: 14px;

  border: 1px solid var(--success-border);
  border-radius: 18px;

  background: var(--success-soft);

  color: var(--success-text);
}

.imp-done-icon svg {
  width: 30px;
  height: 30px;
}


/* =========================================================
   ACTION ROWS
======================================================== */

.imp-actions {
  display: flex;
  justify-content: flex-end;

  gap: 10px;

  margin-top: 22px;
  padding-top: 18px;

  border-top: 1px solid var(--border);
}

.imp-actions-centered {
  justify-content: center;

  margin-top: 6px;
  padding-top: 0;

  border-top: none;
}


/*
 * These two global buttons normally inherit their
 * sizing from .form-actions — provide it here.
 */
.imp-actions .primary-button,
.imp-actions .secondary-button {
  flex: 0 0 auto;

  min-height: 40px;

  padding: 0 17px;

  border-radius: 10px;

  font-size: 11px;
  font-weight: 800;

  text-align: center;
}

.imp-remove {
  flex: 0 0 auto;

  min-height: 30px;

  padding: 0 12px;

  border-radius: 8px;

  font-size: 10px;
  font-weight: 800;
}


/* Disabled affordance for both button flavours */

.import-page button.primary-button:disabled,
.import-page button.secondary-button:disabled {
  opacity: 0.55;

  cursor: not-allowed;

  transform: none;

  box-shadow: none;
}


/* =========================================================
   ICON TILES — let the inline SVGs size themselves
======================================================== */

.empty-icon svg {
  width: 24px;
  height: 24px;
}


/* =========================================================
   RESPONSIVE — one column below ~720px
======================================================== */

@media (max-width: 720px) {
  .source-grid {
    grid-template-columns:
      minmax(0, 1fr);
  }

  .imp-panel-head {
    flex-wrap: wrap;
  }

  .imp-chips {
    width: 100%;

    margin-left: 0;
  }

  .imp-actions {
    flex-direction: column-reverse;
  }

  .imp-actions .primary-button,
  .imp-actions .secondary-button {
    width: 100%;
  }

  .imp-issue-reason {
    margin-left: 0;
  }
}
</style>
