import {
  CancelPaymentRequest,
  CapturePaymentRequest,
  ConfigResponse,
  PaymentProviderModificationResponse,
  RefundPaymentRequest,
  StatusResponse,
} from './types/operations';
import { AbstractPaymentService } from './AbstractPaymentService';
import { SupportedPaymentComponentsSchemaDTO, TransactionDraftDTO, TransactionResponseDTO } from '../dtos/operations';
import { PaymentMethodType, PaymentResponseSchemaDTO } from '../dtos/payment';
import { BraintreePaymentServiceOptions } from './types/payment/BraintreePaymentServiceOptions';
import { BraintreeInitResponse, CreatePaymentRequest } from './types/payment';
import braintree from 'braintree';
import { getConfig } from '../dev-utils/getConfig';

const config = getConfig();

export class BraintreePaymentService extends AbstractPaymentService {
  private braintreeGateway: braintree.BraintreeGateway;

  constructor(opts: BraintreePaymentServiceOptions) {
    super(opts.ctCartService, opts.ctPaymentService);

    this.braintreeGateway = new braintree.BraintreeGateway({
      environment: braintree.Environment.Sandbox,
      merchantId: config.braintreeMerchantId,
      publicKey: config.braintreePublicKey,
      privateKey: config.braintreePrivateKey,
    });
  }

  /**
   * Get configurations
   *
   * @remarks
   * Implementation to provide mocking configuration information
   *
   * @returns Promise with mocking object containing configuration information
   */
  public async config(): Promise<ConfigResponse> {
    throw new Error('Not yet implemented');
  }

  /**
   * Initialize session
   *
   * @remarks
   * Implementation to initialize Braintree payment session
   *
   * @returns Promise returning Braintree client token
   */
  public async init(): Promise<BraintreeInitResponse> {
    try {
      const response = await this.braintreeGateway.clientToken.generate({});
      return { clientToken: response.clientToken };
    } catch (error) {
      console.error('Error in BraintreePaymentService init: ', error);
      throw error;
    }
  }

  /**
   * Get status
   *
   * @remarks
   * Implementation to provide mocking status of external systems
   *
   * @returns Promise with mocking data containing a list of status from different external systems
   */
  public async status(): Promise<StatusResponse> {
    throw new Error('Not yet implemented');
  }

  /**
   * Get supported payment components
   *
   * @remarks
   * Implementation to provide the mocking payment components supported by the processor.
   *
   * @returns Promise with mocking data containing a list of supported payment components
   */
  public async getSupportedPaymentComponents(): Promise<SupportedPaymentComponentsSchemaDTO> {
    // TODO get from braintree
    return {
      dropins: [],
      components: [
        {
          type: PaymentMethodType.CARD,
        },
        {
          type: PaymentMethodType.INVOICE,
        },
        {
          type: PaymentMethodType.PURCHASE_ORDER,
        },
      ],
    };
  }

  /**
   * Capture payment
   *
   * @remarks
   * Implementation to provide the mocking data for payment capture in external PSPs
   *
   * @param request - contains the amount and {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
   * @returns Promise with mocking data containing operation status and PSP reference
   */
  // @ts-expect-error - unused parameter
  public async capturePayment(request: CapturePaymentRequest): Promise<PaymentProviderModificationResponse> {
    throw new Error('Not yet implemented');
  }

  /**
   * Cancel payment
   *
   * @remarks
   * Implementation to provide the mocking data for payment cancel in external PSPs
   *
   * @param request - contains {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
   * @returns Promise with mocking data containing operation status and PSP reference
   */
  // @ts-expect-error - unused parameter
  public async cancelPayment(request: CancelPaymentRequest): Promise<PaymentProviderModificationResponse> {
    throw new Error('Not yet implemented');
  }

  /**
   * Refund payment
   *
   * @remarks
   * Implementation to provide the mocking data for payment refund in external PSPs
   *
   * @param request - contains amount and {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
   * @returns Promise with mocking data containing operation status and PSP reference
   */
  // @ts-expect-error - unused parameter
  public async refundPayment(request: RefundPaymentRequest): Promise<PaymentProviderModificationResponse> {
    throw new Error('Not yet implemented');
  }

  /**
   * Create payment
   *
   * @remarks
   * Implementation to provide the mocking data for payment creation in external PSPs
   *
   * @param request - contains paymentType defined in composable commerce
   * @returns Promise with mocking data containing operation status and PSP reference
   */
  // @ts-expect-error - unused parameter
  public async createPayment(request: CreatePaymentRequest): Promise<PaymentResponseSchemaDTO> {
    throw new Error('Not yet implemented');
  }

  // @ts-expect-error - unused parameter
  public async handleTransaction(transactionDraft: TransactionDraftDTO): Promise<TransactionResponseDTO> {
    throw new Error('Not yet implemented');
  }

  // @ts-expect-error - unused parameter
  private validatePaymentMethod(request: CreatePaymentRequest): void {
    throw new Error('Not yet implemented');
  }
}
