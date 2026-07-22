import { axiosInstance } from "./axiosBase";
import type { AxiosResponse } from "axios";

// Upload document (multipart)
export const uploadDocument = async <T = unknown>(
  formData: FormData
): Promise<AxiosResponse<T> | string> => {
  try {
    return await axiosInstance.post<T>("auth/documents/", formData);
  } catch (error: unknown) {
    const msg =
      error instanceof Error
        ? (error as { response?: { data?: { message?: string } } }).response?.data
            ?.message || "Error uploading document"
        : "Error uploading document";
    return msg;
  }
};

// Upload image (multipart)
export const uploadImage = async <T = unknown>(
  url: string,
  formData: FormData
): Promise<AxiosResponse<T> | string> => {
  try {
    return await axiosInstance.post<T>(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error
        ? (error as { response?: { data?: { message?: string } } }).response?.data
            ?.message || "Error uploading image"
        : "Error uploading image";
    return msg;
  }
};

// Post data
export const postData = async <T = unknown, D = unknown>(
  url: string,
  dataSet: D
): Promise<AxiosResponse<T>> => {
  const isForm =
    typeof FormData !== "undefined" && dataSet instanceof FormData;
  return axiosInstance.post<T>(url, dataSet, {
    headers: isForm ? { "Content-Type": "multipart/form-data" } : {},
  });
};

// Get data
export const getData = async <T = unknown>(
  url: string,
  params: Record<string, unknown> = {}
): Promise<AxiosResponse<T>> => {
  try {
    return await axiosInstance.get<T>(url, { params });
  } catch (err) {
    console.error("Error fetching data:", err);
    throw err;
  }
};

// Delete data
export const deleteData = async <T = unknown>(
  url: string
): Promise<AxiosResponse<T>> => {
  try {
    return await axiosInstance.delete<T>(url);
  } catch (err) {
    console.error("Error deleting data:", err);
    throw err;
  }
};

// Patch data
export const patchData = async <T = unknown, D = unknown>(
  url: string,
  dataSet: D
): Promise<AxiosResponse<T>> => {
  try {
    const isForm =
      typeof FormData !== "undefined" && dataSet instanceof FormData;
    return await axiosInstance.patch<T>(url, dataSet, {
      headers: isForm ? { "Content-Type": "multipart/form-data" } : {},
    });
  } catch (err) {
    console.error("Error updating data:", err);
    throw err;
  }
};

// Put data
export const putData = async <T = unknown, D = unknown>(
  url: string,
  dataSet: D
): Promise<AxiosResponse<T>> => {
  try {
    const isForm =
      typeof FormData !== "undefined" && dataSet instanceof FormData;
    return await axiosInstance.put<T>(url, dataSet, {
      headers: isForm ? { "Content-Type": "multipart/form-data" } : {},
    });
  } catch (err) {
    console.error("Error updating data:", err);
    throw err;
  }
};
