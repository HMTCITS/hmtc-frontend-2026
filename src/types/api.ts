export type PaginateData<Data> = {
  data_per_page: Data;
  meta: {
    page: number;
    max_page: number;
  };
};

export interface PaginatedApiResponse<DataType> {
  code: number;
  status: boolean;
  message: string;
  data: PaginateData<DataType>;
}

/**
 * Envelope returned by the legacy `api.hmtc-its.com` application API.
 *
 * Note: this type previously declared a stray callable member
 * (`id(id): readonly ['galleries', 'detail', number]`) — a copy-paste artefact
 * from the React Query key factory. It was never called, but it mis-typed
 * every `response.data` access in the six client modules that use this type.
 * Removed in the Phase 0 cleanup.
 */
export type ApiResponse<T> = {
  message: string;
  status: boolean;
  code: number;
  data: T;
};

export type ApiError = {
  code: number;
  status: boolean | number;
  message: string;
};

export type UninterceptedApiError = {
  code: number;
  status: boolean;
  message: string | Record<string, string[]>;
};
