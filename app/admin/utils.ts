import axios from "axios";

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const responseError = (error.response?.data as { error?: string })?.error;
    return responseError || error.message || "Error.";
  }

  return "Error.";
};
