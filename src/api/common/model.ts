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

export interface SearchableInput {
  q?: string;
}

export type PaginatedInput<T = object> = T & {
  page?: number;
  size?: number;
}

export interface UpdateInput<T> {
  id: string;
  body: T;
}