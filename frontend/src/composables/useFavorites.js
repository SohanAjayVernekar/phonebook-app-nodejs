import {
  computed,
  ref,
} from "vue";


/* =========================================================
   FAVORITES
   Module-level reactive state (no Pinia) so any component
   — including ones mounted bare in tests — can share the
   same list. Persisted under pb.favorites as a JSON id
   array.
========================================================= */

const STORAGE_KEY = "pb.favorites";


const load = () => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (id) => Number.isFinite(Number(id)),
      ).map(Number);
    }
  } catch {
    /* corrupt or unavailable storage */
  }

  return [];
};


const favorites = ref(load());


const persist = () => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(favorites.value),
    );
  } catch {
    /* storage unavailable — in-memory only */
  }
};


const isFavorite = (id) => {
  return favorites.value.includes(Number(id));
};


const toggleFavorite = (id) => {
  const numeric = Number(id);

  if (!Number.isFinite(numeric)) return false;

  if (isFavorite(numeric)) {
    favorites.value = favorites.value.filter(
      (existing) => existing !== numeric,
    );

    persist();

    return false;
  }

  favorites.value = [...favorites.value, numeric];

  persist();

  return true;
};


const favoriteCount = computed(() => {
  return favorites.value.length;
});


export const useFavorites = () => {
  return {
    favorites,
    favoriteCount,
    isFavorite,
    toggleFavorite,
  };
};
