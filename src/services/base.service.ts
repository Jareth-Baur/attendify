import type { Logger } from "@/types/logging";

export interface ServiceContext {
  actorId: string;
  requestId?: string;
}

export abstract class BaseService {
  protected constructor(protected readonly logger: Logger) {}

  protected getLogContext(context: ServiceContext) {
    return {
      actorId: context.actorId,
      requestId: context.requestId,
    };
  }
}
