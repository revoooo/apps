import { AuthData } from "@saleor/app-sdk/APL";
import {
  OrderConfirmedSubscriptionFragment,
  OrderCreatedSubscriptionFragment,
  OrderFulfilledSubscriptionFragment,
  TaxBaseFragment,
} from "../../../generated/graphql";
import { Logger, createLogger } from "../../lib/logger";
import { OrderCancelledPayload } from "../../pages/api/webhooks/order-cancelled";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { AvataxClient } from "./avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "./avatax-connection-schema";
import { AvataxCalculateTaxesAdapter } from "./calculate-taxes/avatax-calculate-taxes-adapter";
import { AvataxOrderCancelledAdapter } from "./order-cancelled/avatax-order-cancelled-adapter";
import { AvataxOrderConfirmedAdapter } from "./order-confirmed/avatax-order-confirmed-adapter";
import { AvataxOrderCreatedAdapter } from "./order-created/avatax-order-created-adapter";
import { AvataxOrderFulfilledAdapter } from "./order-fulfilled/avatax-order-fulfilled-adapter";

export class AvataxWebhookService implements ProviderWebhookService {
  config = defaultAvataxConfig;
  client: AvataxClient;
  private logger: Logger;

  constructor(config: AvataxConfig, private authData: AuthData) {
    this.logger = createLogger({
      name: "AvataxWebhookService",
    });
    const avataxClient = new AvataxClient(config);

    this.config = config;
    this.client = avataxClient;
  }

  async calculateTaxes(taxBase: TaxBaseFragment) {
    const adapter = new AvataxCalculateTaxesAdapter(this.config, this.authData);

    const response = await adapter.send({ taxBase });

    return response;
  }

  async confirmOrder(order: OrderConfirmedSubscriptionFragment) {
    const adapter = new AvataxOrderConfirmedAdapter(this.config, this.authData);

    const response = await adapter.send({ order });

    return response;
  }

  /**
   * @deprecated This method is deprecated and will be removed in the future.
   */
  async fulfillOrder(order: OrderFulfilledSubscriptionFragment) {
    const adapter = new AvataxOrderFulfilledAdapter(this.config);

    const response = await adapter.send({ order });

    return response;
  }

  async cancelOrder(payload: OrderCancelledPayload) {
    const adapter = new AvataxOrderCancelledAdapter(this.config);

    await adapter.send(payload);
  }

  /**
   * @deprecated This method is deprecated and will be removed in the future.
   */
  async createOrder(payload: OrderCreatedSubscriptionFragment) {
    const adapter = new AvataxOrderCreatedAdapter(this.config, this.authData);

    const response = await adapter.send({ order: payload });

    return response;
  }
}
