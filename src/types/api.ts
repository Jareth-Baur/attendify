export interface ApiMeta {
  requestId?: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccess<TData> {
  success: true;
  data: TData;
  message: string;
  meta?: ApiMeta;
}

export interface ApiFailure {
  success: false;
  error: ApiErrorPayload;
  meta?: ApiMeta;
}

export type ApiResponse<TData> = ApiSuccess<TData> | ApiFailure;
