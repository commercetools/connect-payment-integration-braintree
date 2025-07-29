import { describe, expect, test } from "@jest/globals";
import { mapCtTotalPriceToBraintreeAmount } from "../../../src/services/mappers";

describe("mapCtTotalPriceToBraintreeAmount", () => {
	test("throws error when centAmount passed is a non-positive integer or 0", () => {
		const totalPrice = {
			centAmount: -1,
			fractionDigits: 0,
		};
		expect(() => mapCtTotalPriceToBraintreeAmount(totalPrice)).toThrow(
			`Payment cent amount must be a positive integer above zero, received ${totalPrice.centAmount}.`,
		);

		totalPrice.centAmount = 1.2;
		expect(() => mapCtTotalPriceToBraintreeAmount(totalPrice)).toThrow(
			`Payment cent amount must be a positive integer above zero, received ${totalPrice.centAmount}.`,
		);

		totalPrice.centAmount = 0;
		expect(() => mapCtTotalPriceToBraintreeAmount(totalPrice)).toThrow(
			`Payment cent amount must be a positive integer above zero, received ${totalPrice.centAmount}.`,
		);
	});

	test("returns string version of centAmount passed when fractionDigits are zero", async () => {
		const totalPrice = {
			centAmount: 3457,
			fractionDigits: 0,
		};
		expect(mapCtTotalPriceToBraintreeAmount(totalPrice)).toStrictEqual(`${totalPrice.centAmount}`);

		totalPrice.centAmount = 800000000;
		expect(mapCtTotalPriceToBraintreeAmount(totalPrice)).toStrictEqual(`${totalPrice.centAmount}`);

		totalPrice.centAmount = 1;
		expect(mapCtTotalPriceToBraintreeAmount(totalPrice)).toStrictEqual(`${totalPrice.centAmount}`);
	});

	test("returns string version of centAmount/10 passed when fractionDigits are 1", () => {
		const totalPrice = {
			centAmount: 3457,
			fractionDigits: 1,
		};
		expect(mapCtTotalPriceToBraintreeAmount(totalPrice)).toStrictEqual("345.7");

		totalPrice.centAmount = 800000000;
		expect(mapCtTotalPriceToBraintreeAmount(totalPrice)).toStrictEqual("80000000");

		totalPrice.centAmount = 1;
		expect(mapCtTotalPriceToBraintreeAmount(totalPrice)).toStrictEqual("0.1");
	});

	test("returns string version of centAmount/100 passed when fractionDigits are 2", () => {
		const totalPrice = {
			centAmount: 3457,
			fractionDigits: 2,
		};
		expect(mapCtTotalPriceToBraintreeAmount(totalPrice)).toStrictEqual("34.57");

		totalPrice.centAmount = 800000000;
		expect(mapCtTotalPriceToBraintreeAmount(totalPrice)).toStrictEqual("8000000");

		totalPrice.centAmount = 1;
		expect(mapCtTotalPriceToBraintreeAmount(totalPrice)).toStrictEqual("0.01");
	});

	test("returns string version of centAmount/10000 passed when fractionDigits are 4", () => {
		const totalPrice = {
			centAmount: 3457,
			fractionDigits: 4,
		};
		expect(mapCtTotalPriceToBraintreeAmount(totalPrice)).toStrictEqual("0.3457");

		totalPrice.centAmount = 800000000;
		expect(mapCtTotalPriceToBraintreeAmount(totalPrice)).toStrictEqual("80000");

		totalPrice.centAmount = 1;
		expect(mapCtTotalPriceToBraintreeAmount(totalPrice)).toStrictEqual("0.0001");
	});
});
