import { isAxiosError } from "axios";

export const axiosErrorHandler = (error:unknown) => {
 let errorMessage = "Unknown error";

    // Penanganan error khusus untuk Axios
    if (error instanceof Error) {
      // Cek apakah error adalah AxiosError
      if (isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message;
      } else {
        errorMessage = error.message;
      }
    }
    return errorMessage;
}