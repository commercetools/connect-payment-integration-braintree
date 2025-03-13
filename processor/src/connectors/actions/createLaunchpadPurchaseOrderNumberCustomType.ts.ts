import { launchpadPurchaseOrderCustomType } from '../../custom-types/launchpadPurchaseOrderCustomType';
import { logger } from '../../libs/logger';
import { paymentSDK } from '../../sdk/paymentSDK';

export async function createLaunchpadPurchaseOrderNumberCustomType(): Promise<void> {
  const apiClient = paymentSDK.ctAPI.client;

  const getRes = await apiClient
    .types()
    .get({
      queryArgs: {
        where: `key="${launchpadPurchaseOrderCustomType.key}"`,
      },
    })
    .execute();

  if (getRes.body.results.length) {
    logger.info('Launchpad purchase order number custom type already exists. Skipping creation.');
    return;
  }

  const postRes = await apiClient
    .types()
    .post({
      body: {
        key: launchpadPurchaseOrderCustomType.key,
        name: { en: 'Additional fields to store purchase order information' },
        resourceTypeIds: ['payment'],
        fieldDefinitions: [
          {
            type: {
              name: 'String',
            },
            name: launchpadPurchaseOrderCustomType.purchaseOrderNumber,
            label: {
              en: 'Purchase Order Number',
            },
            required: true,
          },
          {
            type: {
              name: 'String',
            },
            name: launchpadPurchaseOrderCustomType.invoiceMemo,
            label: {
              en: 'Invoce Memo',
            },
            required: false,
          },
        ],
      },
    })
    .execute();

  logger.info('Launchpad purchase order number custom type created successfully', postRes.body?.id);
}
