import type { EntityId, Identifiable, PaginatedResult } from "@/types/common";
import type { QueryOptions, Repository, SoftDeleteRepository } from "@/types/repository";

export abstract class BaseRepository<
  TEntity extends Identifiable,
  TCreateInput,
  TUpdateInput,
> implements Repository<TEntity, TCreateInput, TUpdateInput> {
  abstract findById(id: EntityId): Promise<TEntity | null>;
  abstract findMany(options?: QueryOptions): Promise<PaginatedResult<TEntity>>;
  abstract create(input: TCreateInput): Promise<TEntity>;
  abstract update(id: EntityId, input: TUpdateInput): Promise<TEntity>;
}

export abstract class SoftDeletableRepository<
  TEntity extends Identifiable,
  TCreateInput,
  TUpdateInput,
> extends BaseRepository<TEntity, TCreateInput, TUpdateInput> implements SoftDeleteRepository<TEntity> {
  abstract softDelete(id: EntityId, deletedById: EntityId): Promise<TEntity>;
}
