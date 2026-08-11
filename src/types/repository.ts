import type { EntityId, PaginatedResult, PaginationInput } from "@/types/common";

export interface QueryOptions extends PaginationInput {
  includeDeleted?: boolean;
}

export interface Repository<TEntity, TCreateInput, TUpdateInput> {
  findById(id: EntityId): Promise<TEntity | null>;
  findMany(options?: QueryOptions): Promise<PaginatedResult<TEntity>>;
  create(input: TCreateInput): Promise<TEntity>;
  update(id: EntityId, input: TUpdateInput): Promise<TEntity>;
}

export interface SoftDeleteRepository<TEntity> {
  softDelete(id: EntityId, deletedById: EntityId): Promise<TEntity>;
}
