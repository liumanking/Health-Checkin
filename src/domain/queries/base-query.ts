/** 一般實體共用的 Query specification。 */
export interface BaseQuery {
  memberId?: string;
  includeDeleted?: boolean;
}
