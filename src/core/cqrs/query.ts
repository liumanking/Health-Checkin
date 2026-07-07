/**
 * Query base（讀意圖）：無副作用，不發事件、不寫稽核。
 */
export interface Query<TInput, TOutput> {
  readonly name: string;
  execute(input: TInput): Promise<TOutput>;
}
