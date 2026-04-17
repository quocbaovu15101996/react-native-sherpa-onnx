import type { ModelCategory } from './types';
export declare function makeModelOperationKey(category: ModelCategory, modelId: string): string;
export declare function registerActivePostProcess(category: ModelCategory, modelId: string): void;
export declare function unregisterActivePostProcess(category: ModelCategory, modelId: string): void;
export declare function getActivePostProcessKeys(): ReadonlySet<string>;
//# sourceMappingURL=activeModelOperations.d.ts.map