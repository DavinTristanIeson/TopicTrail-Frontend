import { UserDataModel } from '@/api/userdata';

export interface UserDataManagerHookProps<T> {
  // This will be used to save the current state.
  state: T | null;
  // A callback when the load button is pressed.
  onApply(state: T): void;
}

export interface UserDataInput {
  id: string | null;
  name: string;
  tags: string[] | null;
  description: string | null;
}

export interface UserDataManagerRendererProps<T> {
  // A list of all options
  data: UserDataModel<T>[];
  // The renderer only needs to give the metadata. The hook should handle passing the data.
  onSave(data: UserDataInput): Promise<void>;
  // A callback to apply the state. This will call ``UserDataManagerHookProps.onApply``.
  onLoad(id: string): void;
  onDelete(id: string): Promise<void>;
}
