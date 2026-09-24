import {
  onBeforeUnmount,
  onMounted,
} from "vue";


/*
 * Scroll reveal: adds .in to .reveal descendants when
 * they enter the viewport. Purely presentational.
 */
export function useReveal(rootRef, selector = ".reveal") {
  let observer = null;

  onMounted(() => {
    const root = rootRef.value;

    if (!root) {
      return;
    }

    const targets = root.querySelectorAll(selector);

    if (
      typeof IntersectionObserver === "undefined"
    ) {
      targets.forEach((el) => el.classList.add("in"));
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    targets.forEach((el) => observer.observe(el));
  });

  onBeforeUnmount(() => {
    observer?.disconnect();

    observer = null;
  });
}
