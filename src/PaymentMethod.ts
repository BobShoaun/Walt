export interface PaymentMethod {
    name: string;
    slug: string;
}

export const paymentMethods: PaymentMethod[] = [{
    name: "Credit Card",
    slug: "credit-card"
}, {
    name: "Debit Card",
    slug: "debit-card"
}, {
    name: "Cash",
    slug: "cash",
}, {
    name: "Bank Transfer",
    slug: "bank-transfer"
}]