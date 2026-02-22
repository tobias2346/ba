export const entorno = process.env.NEXT_PUBLIC_ENTORNO;
export const API_BASE_URL =
  entorno === "develop"
    ? process.env.NEXT_PUBLIC_API_DEV_URL
    : process.env.NEXT_PUBLIC_API_URL;

export const credentialsOption: RequestCredentials =
  entorno !== "develop" ? "include" : "omit";