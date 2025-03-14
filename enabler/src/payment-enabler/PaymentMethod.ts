/**
 * Represents the payment method code.
 */
export enum PaymentMethod {
  /* Apple Pay */
  applepay = "applepay",
  /* Bancontact card */
  bancontactcard = "bcmc",
  /* Card */
  card = "card",
  /* EPS */
  eps = "eps",
  /* Google Pay */
  googlepay = "googlepay",
  /* iDeal */
  ideal = "ideal",
  /* iDeal */
  invoice = "invoice",
  /* Klarna Pay Later */
  klarna_pay_later = "klarna",
  /* Klarna Pay Now */
  klarna_pay_now = "klarna_paynow",
  /* Klarna Pay Over Time */
  klarna_pay_overtime = "klarna_account",
  /* PayPal */
  paypal = "paypal",
  /* Purchase Order */
  purchaseorder = "purchaseorder",
  /* TWINT */
  twint = "twint",
}
