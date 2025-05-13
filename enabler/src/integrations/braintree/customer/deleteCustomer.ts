import { getConfig } from "../../../../dev-utils";

export type DeleteBraintreeCustomerRequest = {
  customerId: string;
};

export const deleteCustomer = async function (
  sessionId: string,
  request: DeleteBraintreeCustomerRequest
): Promise<boolean> {
  let response!: Response;
  try {
    response = await fetch(`${getConfig().PROCESSOR_URL}/customer/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-Id": sessionId,
      },
      body: JSON.stringify(request),
    });
    if (response.ok) {
      return true;
    } else {
      console.log("Delete customer response: ", response);
      return false;
    }
  } catch (error) {
    console.log("Delete customer error: ", error);
    console.log("Delete customer response: ", response);
    return false;
  }
};
