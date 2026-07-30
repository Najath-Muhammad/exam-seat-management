

let accessToken: string | null = null;

export const getToken = () => accessToken;

export const setToken = (token: string | null) => {
  accessToken = token;
};
