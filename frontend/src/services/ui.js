/* =========================================================
   UI BRIDGE
   Plain-module bridge between components and App.vue's
   toast / confirm implementations.

   Components (ContactCard, ContactTableRow, ContactList, …)
   are sometimes mounted in tests without Pinia or App.vue,
   so they call these helpers instead of reaching into a
   store. When no handler is registered the calls degrade
   to console / window.confirm.
========================================================= */

let toastHandler = null;

let confirmHandler = null;


/* App.vue registers these on setup */
export const registerToast = (handler) => {
  toastHandler = handler;
};


export const registerConfirm = (handler) => {
  confirmHandler = handler;
};


/* =========================================================
   toast(type, title, message?)
   type: "success" | "error" | "warning" | "info"
========================================================= */

export const toast = (
  type = "info",
  title = "",
  message = "",
) => {

  if (toastHandler) {
    return toastHandler({
      type,
      title,
      message,
    });
  }


  /* fallback for tests / late registration */
  const level =
    type === "error" ? "error" : "log";

  console[level](
    `[toast:${type}] ${title}${
      message ? ` — ${message}` : ""
    }`,
  );

  return null;
};


/* =========================================================
   confirmAction(options) → Promise<boolean>

   options: {
     title, message, confirmText,
     cancelText, danger
   }
========================================================= */

export const confirmAction = (options = {}) => {

  if (confirmHandler) {
    return confirmHandler(options);
  }


  const text =
    options.message ||
    options.title ||
    "Are you confirm?";


  return Promise.resolve(
    window.confirm(text),
  );
};
