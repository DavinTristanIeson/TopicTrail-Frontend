import { useGetEnum } from "@/api/common/query";
import { EnumList } from "@/common/constants/enum";
import { Loader, Select, SelectProps } from "@mantine/core";

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
