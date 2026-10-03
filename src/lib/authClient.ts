export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token") || "mock-token";
  }
  return "mock-token";
};
