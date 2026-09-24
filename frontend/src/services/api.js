import axios from "axios";


const api = axios.create({
  /*
   * Nginx proxies /api/* to the .NET backend.
   *
   * Using a relative URL means the browser always uses
   * the same origin (http://localhost served by Nginx),
   * so no CORS configuration is needed:
   * - localhost works
   * - no hard-coded backend URL / port
   */
  baseURL: "/api",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 10000,
});


// =========================================================
// Add JWT token to every API request
// =========================================================

api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem(
        "access_token"
      );


    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }


    return config;

  },

  (error) => {

    return Promise.reject(
      error
    );

  }
);


export default api;