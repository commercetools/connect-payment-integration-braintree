import { getConfig } from "../../../../dev-utils";
import type { CreateBraintreeCustomerRequest } from "./createCustomer";

export type FindBraintreeCustomerRequest = {
  customerId: string;
};

// incomplete, decide if worth creating a proper type/shared types
type FindBraintreeCustomerResponse = CreateBraintreeCustomerRequest & {
  id: string;
};

const config = getConfig();

export const findCustomer = async function (
  sessionId: string,
  
): Promise<FindBraintreeCustomerResponse | false> {
  let response!: Response;
  try {
    response = await fetch(`${config.PROCESSOR_URL}/customer/find`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Id": sessionId,
      },
 
    });

    const customer = await response.json();
    return customer;
  } catch (error) {
    console.log("Find customer error: ", error);
    console.log("Find customer response: ", response);
    return false;
  }
};
