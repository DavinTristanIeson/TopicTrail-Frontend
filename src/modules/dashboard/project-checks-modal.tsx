import {
  useProjectCheckDataset,
  useProjectCheckId,
} from "@/api/project/mutation";
import Colors from "@/common/constants/colors";
import SubmitButton from "@/components/standard/button/submit";
import FormWrapper from "@/components/utility/form/wrapper";
import { yupResolver } from "@hookform/resolvers/yup";
import { Alert, TextInput, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import React from "react";
import * as Yup from "yup";
import Text from "@/components/standard/text";
import { useForm } from "react-hook-form";
import { CheckCircle } from "@phosphor-icons/react";
import {
  ProjectCheckDatasetInput,
  ProjectCheckDatasetModel,
  ProjectCheckIdInput,
} from "@/api/project/model";

const CheckProjectIdSchema = Yup.object({
  projectId: Yup.string()
    .required()
    .max(255)
    .matches(
      /[a-zA-Z0-9-_. ]+/,
      "The project name must also be a valid file name."
    ),
});
type CheckProjectIdType = Yup.InferType<typeof CheckProjectIdSchema>;

interface CreateProjectFlow_CheckProjectIdProps {
  onContinue(props: ProjectCheckIdInput): void;
}

export function CreateProjectFlow_CheckProjectId(
  props: CreateProjectFlow_CheckProjectIdProps
) {
  const { mutateAsync: check } = useProjectCheckId();
  const resolver = yupResolver(CheckProjectIdSchema);
  const form = useForm<CheckProjectIdType>({
    defaultValues: {
      projectId: "",
    },
    mode: "onChange",
    resolver,
  });

  const handleSubmit = async (values: CheckProjectIdType) => {
    const res = await check(values);
    if (res.message) {
      showNotification({
        message: res.message,
        color: Colors.sentimentSuccess,
      });
    }
    props.onContinue(values);
  };

  return (
    <FormWrapper form={form} onSubmit={handleSubmit}>
      <Title order={2}>1/3: What&apos;s the name of your project?</Title>
      <Alert>
        First things first, please specify the name of your project. Note that
        your project can be found in the{" "}
        <Text
          style={{
            fontFamily: "monospace",
          }}
        >
          data
        </Text>{" "}
        directory in the same directory as the Wordsmith Project.
      </Alert>

      <TextInput
        {...form.register("projectId")}
        label="Project Name"
        placeholder="Enter the name of your project"
      />

      <SubmitButton leftSection={<CheckCircle size={20} />}>
        Check Project Name
      </SubmitButton>
    </FormWrapper>
  );
}

interface CreateProjectFlow_CheckDatasetProps {
  onContinue(
    input: ProjectCheckDatasetInput,
    values: ProjectCheckDatasetModel
  ): void;
}

const CheckDatasetPathSchema = Yup.object({
  path: Yup.string()
    .required()
    .matches(/[a-zA-Z0-9-_. /\/]+/, "Please provide a valid path"),
});
type CheckDatasetPathSchema = Yup.InferType<typeof CheckDatasetPathSchema>;

export function CreateProjectFlow_CheckDataset(
  props: CreateProjectFlow_CheckDatasetProps
) {
  const { mutateAsync: check } = useProjectCheckDataset();
  const resolver = yupResolver(CheckDatasetPathSchema);
  const form = useForm<CheckDatasetPathSchema>({
    defaultValues: {
      path: "",
    },
    mode: "onChange",
    resolver,
  });

  const handleSubmit = async (values: ProjectCheckDatasetInput) => {
    const res = await check(values);
    if (res.message) {
      showNotification({
        message: res.message,
        color: Colors.sentimentSuccess,
      });
    }
    props.onContinue(values, res.data);
  };

  return (
    <FormWrapper form={form} onSubmit={handleSubmit}>
      <Alert>
        Next, we need a dataset to get started. Please specify the file path
        (e.g.: /user/path/to/dataset, ../path/to/dataset,
        C:/Users/User/path/to/dataset) so that we can access the dataset. Please
        note that the dataset should be of type CSV, PARQUET, or EXCEL.
      </Alert>

      <TextInput
        {...form.register("path")}
        label="Dataset Path"
        placeholder="Enter the path (preferably absolute) of your dataset. You can also specify the path relative to the directory of the Wordsmith Project, but this is not recommended."
      />

      <SubmitButton leftSection={<CheckCircle size={20} />}>
        Verify Dataset
      </SubmitButton>
    </FormWrapper>
  );
}
