import React from 'react';

export interface FormEditableContextType {
  editable: boolean;
  setEditable: React.Dispatch<React.SetStateAction<boolean>>;
}
export const FormEditableContext = React.createContext<FormEditableContextType>(
  {
    editable: true,
    setEditable() {},
  },
);
