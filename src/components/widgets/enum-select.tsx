import { useGetEnum } from "@/api/common/query";
import { EnumList } from "@/common/constants/enum";
import { Loader, Select, SelectProps } from "@mantine/core";
import { useController } from "react-hook-form";

interface EnumSelectInputProps extends SelectProps {
  type: EnumList;
}

export default function EnumSelect(props: EnumSelectInputProps) {
  const { data, isLoading } = useGetEnum(props.type);

  return (
    <Select
      data={data?.data}
      disabled={isLoading}
      rightSection={isLoading && <Loader size={16} />}
      {...props}
    />
  );
}

interface EnumSelectFieldProps extends EnumSelectInputProps {
  name: string;
}

export function EnumSelectField(props: EnumSelectFieldProps) {
  const { field } = useController({
    name: props.name,
  });

  return <EnumSelect {...field} {...props} />;
}
