export class BoundingBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export class Point {
  x: number;
  y: number;
}

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