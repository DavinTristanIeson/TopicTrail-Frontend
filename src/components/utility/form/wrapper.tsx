import { handleFormSubmission } from "@/common/utils/form";
import React from "react";
import {
  FieldValues,
  Form,
  FormProvider,
  UseFormReturn,
} from "react-hook-form";

interface FormMetaState {
  editable: boolean;
  setEditable: React.Dispatch<React.SetStateAction<boolean>>;
}

const FormMetaStateContext = React.createContext<FormMetaState>({
  editable: false,
  setEditable() {},
});

interface FormWrapperProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit(values: T): void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export default function FormWrapper<T extends FieldValues>(
  props: FormWrapperProps<T>
) {
  const handleSubmit = props.form.handleSubmit(
    handleFormSubmission(props.onSubmit, props.form.setError),
    console.error
  );
  const [editable, setEditable] = React.useState(false);
  return (
    <FormProvider {...props.form}>
      <Form
        control={props.form.control}
        onSubmit={handleSubmit as any}
        className={props.className}
        style={props.style}
      >
        <FormMetaStateContext.Provider value={{ editable, setEditable }}>
          {props.children}
        </FormMetaStateContext.Provider>
      </Form>
    </FormProvider>
  );
}
