// Model
export class EnumModel {
  label: string;
  value: string;
  description?: string;
}

export type DataFrame = Record<string, any>[];

// Input

export interface IdInput {
  id: string;
}

export type PaginatedInput = {
  page?: number;
  limit?: number;
}

export interface UpdateInput<T> {
  id: string;
  body: T;
}