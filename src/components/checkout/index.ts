/**
 * Checkout / Payment components for LifeOps subscription flows.
 * Spec aliases: SecurePaymentCard (card input), PaymentMethodPicker (saved/new method picker).
 */

export { PlanSelector } from "@/components/checkout/plan-selector";
export { ProgressStepper } from "@/components/checkout/progress-stepper";
export type { CheckoutStepId } from "./progress-stepper";
export { SummaryPanel } from "./summary-panel";
export { BillingForm } from "./billing-form";
export { PaymentMethodSection } from "./payment-method-section";
export { PromoCodeInput } from "./promo-code-input";
export { AddressFields } from "./address-fields";
export { CardInput } from "./card-input";
export { InvoicePanel } from "./invoice-panel";
export { ConfirmationModal } from "./confirmation-modal";
export { StatusBanner } from "./status-banner";

/** Spec name: secure card input; no raw card data stored (PCI-safe). */
export { CardInput as SecurePaymentCard } from "./card-input";

/** Spec name: pick saved payment method or add new. */
export { PaymentMethodSection as PaymentMethodPicker } from "./payment-method-section";
