export type SubsetInputData = {
  isOptional?: boolean;
  id: string;
  parameterName?: string;
  label?: string;
  value?: string;
  inputStyle?: string;
  labelStyle?: string;
  type?: string;
};

export const customerFormElementsData: SubsetInputData[] = [
  {
    id: "customerFirstName",
    parameterName: "firstName",
    label: "*First name:",
    labelStyle: "margin-right: 5px",
  },
  {
    id: "customerLastName",
    parameterName: "lastName",
    label: "*Last name:",
    labelStyle: "margin-right: 5px",
  },
  {
    id: "customerEmail",
    parameterName: "email",
    label: "*Email:",
    labelStyle: "margin-right: 5px",
  },
  {
    isOptional: true,
    id: "customerCompany",
    parameterName: "company",
    label: "Company:",
    labelStyle: "margin-right: 5px",
  },
  {
    isOptional: true,
    id: "customerPhone",
    parameterName: "phone",
    label: "Phone:",
    labelStyle: "margin-right: 5px",
  },
  {
    isOptional: true,
    id: "customerWebsite",
    parameterName: "website",
    label: "Website:",
    labelStyle: "margin-right: 5px",
  },
  {
    isOptional: true,
    id: "customFields",
    label: "Custom fields:",
    labelStyle: "margin-right: 5px",
  },
];
