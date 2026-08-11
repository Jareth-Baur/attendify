export type EntityId = string;

export interface Identifiable {
  id: EntityId;
}

export interface AuditedEntity extends Identifiable {
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationInput {
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<TItem> {
  items: TItem[];
  pagination: PaginationMeta;
}
