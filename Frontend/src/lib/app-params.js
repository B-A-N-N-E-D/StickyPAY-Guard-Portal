const isNode = typeof window === "undefined";

const getToken = () => {
  if (isNode) return null;
  return localStorage.getItem("token");
};

const getFromUrl = () => {
  if (isNode) return null;
  return window.location.href;
};

export const appParams = {
  token: getToken(),
  fromUrl: getFromUrl()
};