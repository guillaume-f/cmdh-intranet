import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestStore {
  requestId: string;
  userId?: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestStore>();

/**
 * Correlates a request id (and, once authenticated, a user id) across
 * middleware, interceptors, exception filters and services without having
 * to thread them through every function call.
 */
export class RequestContext {
  static run<T>(store: RequestStore, callback: () => T): T {
    return asyncLocalStorage.run(store, callback);
  }

  static get(): RequestStore | undefined {
    return asyncLocalStorage.getStore();
  }

  static getRequestId(): string | undefined {
    return asyncLocalStorage.getStore()?.requestId;
  }

  static setUserId(userId: string): void {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store.userId = userId;
    }
  }
}
