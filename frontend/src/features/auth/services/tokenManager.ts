// Simple in-memory token manager to avoid circular dependencies
// between Axios interceptors and the React AuthContext.

let accessToken: string | null = null;

export const getToken = () => accessToken;

export const setToken = (token: string | null) => {
  accessToken = token;
};
