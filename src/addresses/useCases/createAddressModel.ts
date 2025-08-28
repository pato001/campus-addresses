import { object, string } from "yup";

type Field = {
    label: string;
    requirement: 'MANDATORY' | 'OPTIONAL';
    maxLength?: number;
    disabled?: boolean;
    value?: string;
};
export type Fields = Partial<{
    buildingName: Field;
    street: Field;
    districtName: Field;
    postalCode: Field;
    townName: Field;
    regionName: Field;
    country: Field;
}>;
export const createAddressModel = (fields:Fields) => {

  const validate = (data:any) => {
    const schema = Object.entries(fields).reduce((result, [key, field]) => {
      if (field.requirement !== 'MANDATORY') {
        return result;
      }

      return {
        ...result,
        [key]: string().required(`${field.label} is missing.`),
      };
    }, {});
    const address = object(schema).validateSync(data, { abortEarly: false });
    return address;
  }
  return {
    validate
  }
}