import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getData,
  postData,
  putData,
  patchData,
  deleteData,
  uploadImage,
} from "../services/api/axiosInstance";

interface ApiError {
  response?: {
    data?: Record<string, unknown>;
    status?: number;
    statusText?: string;
  };
}

const getErrorMessage = (error: unknown): string => {
  const err = error as ApiError;
  const data = err.response?.data || {};
  return (
    (data.error as string) ||
    (data.detail as string) ||
    (data.message as string) ||
    (data.name as string[])?.[0] ||
    (data.non_field_errors as string[])?.[0] ||
    err.response?.statusText ||
    "Something went wrong"
  );
};

interface SliceFactoryConfig {
  name: string;
  url: string;
}

export const createSliceFactory = <T extends { id: number | string }>({
  name,
  url,
}: SliceFactoryConfig) => {
  // Fetch all data with params
  const fetchAll = createAsyncThunk(
    `${name}/fetchAll`,
    async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
      try {
        const response = await getData<{
          data: { results: T[]; count: number };
        }>(url, params as Record<string, unknown>);
        return {
          data: response.data.data.results,
          total: response.data.data.count,
        };
      } catch (error) {
        return rejectWithValue(
          (error as ApiError).response?.data || { error: getErrorMessage(error) }
        );
      }
    }
  );

  // Fetch a single item by ID
  const fetchSingle = createAsyncThunk(
    `${name}/fetchSingle`,
    async (id: number | string, { rejectWithValue }) => {
      try {
        const response = await getData<{ data: T }>(`${url}${id}/`);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(
          (error as ApiError).response?.data || { error: getErrorMessage(error) }
        );
      }
    }
  );

  // Post new data
  const postDataThunk = createAsyncThunk(
    `${name}/postData`,
    async (
      { payload, onSuccess }: { payload: unknown; onSuccess?: () => void },
      { rejectWithValue }
    ) => {
      try {
        const response = await postData<T, unknown>(url, payload);
        if (response.status === 200 || response.status === 201) {
          onSuccess?.();
        }
        return response.data;
      } catch (error) {
        if ((error as ApiError).response?.status === 400) {
          console.error(getErrorMessage(error));
        }
        return rejectWithValue(
          (error as ApiError).response?.data || { error: getErrorMessage(error) }
        );
      }
    }
  );

  // Update existing data (PUT)
  const updateDataThunk = createAsyncThunk(
    `${name}/updateData`,
    async (
      { id, payload }: { id: number | string; payload: unknown },
      { rejectWithValue }
    ) => {
      try {
        const response = await putData<T, unknown>(`${url}${id}/`, payload);
        return response.data;
      } catch (error) {
        const status = (error as ApiError).response?.status;
        if (status === 400 || status === 405) {
          console.error(getErrorMessage(error));
        }
        return rejectWithValue(
          (error as ApiError).response?.data || { error: getErrorMessage(error) }
        );
      }
    }
  );

  // Patch existing data (PATCH)
  const patchDataThunk = createAsyncThunk(
    `${name}/patchData`,
    async (
      { id, payload }: { id: number | string; payload: unknown },
      { rejectWithValue }
    ) => {
      try {
        const response = await patchData<T, unknown>(`${url}${id}/`, payload);
        return response.data;
      } catch (error) {
        if ((error as ApiError).response?.status === 400) {
          console.error(getErrorMessage(error));
        }
        return rejectWithValue(
          (error as ApiError).response?.data || { error: getErrorMessage(error) }
        );
      }
    }
  );

  // Delete data (DELETE)
  const deleteDataThunk = createAsyncThunk(
    `${name}/deleteData`,
    async (id: number | string, { rejectWithValue }) => {
      try {
        await deleteData(`${url}${id}/`);
        return id;
      } catch (error) {
        console.error(getErrorMessage(error));
        return rejectWithValue(
          (error as ApiError).response?.data || { error: getErrorMessage(error) }
        );
      }
    }
  );

  // Post Image
  const postImageThunk = createAsyncThunk(
    `${name}/postImage`,
    async (
      { payload, onSuccess }: { payload: FormData; onSuccess?: () => void },
      { rejectWithValue }
    ) => {
      try {
        const response = await uploadImage<T>(url, payload);
        if (response.status === 200 || response.status === 201) {
          onSuccess?.();
        }
        return response.data;
      } catch (error) {
        if ((error as ApiError).response?.status === 400) {
          console.error(getErrorMessage(error));
        }
        return rejectWithValue(
          (error as ApiError).response?.data || { error: getErrorMessage(error) }
        );
      }
    }
  );

  // Create the slice
  const slice = createSlice({
    name,
    initialState: {
      data: [] as T[],
      singleData: {} as T | Record<string, never>,
      isLoading: false,
      error: null as Record<string, unknown> | null,
      totalItems: 0,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        // Fetch All
        .addCase(fetchAll.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(fetchAll.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload.data;
          state.totalItems = action.payload.total;
          state.error = null;
        })
        .addCase(fetchAll.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as Record<string, unknown>;
        })

        // Fetch Single
        .addCase(fetchSingle.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(fetchSingle.fulfilled, (state, action) => {
          state.isLoading = false;
          state.singleData = action.payload;
          state.error = null;
        })
        .addCase(fetchSingle.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as Record<string, unknown>;
        })

        // Post Data
        .addCase(postDataThunk.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(postDataThunk.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = [...state.data, action.payload as T];
          state.error = null;
        })
        .addCase(postDataThunk.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as Record<string, unknown>;
        })

        // Update Data
        .addCase(updateDataThunk.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(updateDataThunk.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = state.data.map((item) =>
            item.id === (action.payload as T).id
              ? (action.payload as T)
              : item
          );
          state.error = null;
        })
        .addCase(updateDataThunk.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as Record<string, unknown>;
        })

        // Patch Data
        .addCase(patchDataThunk.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(patchDataThunk.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = state.data.map((item) =>
            item.id === (action.payload as T).id
              ? (action.payload as T)
              : item
          );
          state.error = null;
        })
        .addCase(patchDataThunk.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as Record<string, unknown>;
        })

        // Delete Data
        .addCase(deleteDataThunk.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(deleteDataThunk.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = state.data.filter((item) => item.id !== action.payload);
          state.error = null;
        })
        .addCase(deleteDataThunk.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as Record<string, unknown>;
        })

        // Post Image
        .addCase(postImageThunk.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(postImageThunk.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = [...state.data, action.payload as T];
          state.error = null;
        })
        .addCase(postImageThunk.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as Record<string, unknown>;
        });
    },
  });

  return {
    reducer: slice.reducer,
    fetchAll,
    fetchSingle,
    postData: postDataThunk,
    updateData: updateDataThunk,
    patchData: patchDataThunk,
    deleteData: deleteDataThunk,
    postImage: postImageThunk,
  };
};
