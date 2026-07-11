// Enums
export var ItemStatus;
(function (ItemStatus) {
    ItemStatus["AVAILABLE"] = "available";
    ItemStatus["SOLD"] = "sold";
    ItemStatus["TRANSFERRED"] = "transferred";
    ItemStatus["RETURNED"] = "returned";
    ItemStatus["BOOKED"] = "booked";
    ItemStatus["SCRAPPED"] = "scrapped";
    ItemStatus["IN_CART"] = "in_cart";
})(ItemStatus || (ItemStatus = {}));
export var ItemCondition;
(function (ItemCondition) {
    ItemCondition["SEALED_PACK"] = "sealed_pack";
    ItemCondition["OPEN_BOX"] = "open_box";
    ItemCondition["SUPER_MINT"] = "super_mint";
    ItemCondition["MINT"] = "mint";
    ItemCondition["GOOD"] = "good";
})(ItemCondition || (ItemCondition = {}));
export var BoxType;
(function (BoxType) {
    BoxType["WITH_BOX"] = "with_box";
    BoxType["WITHOUT_BOX"] = "without_box";
    BoxType["ACCESSORIES_ONLY"] = "accessories_only";
})(BoxType || (BoxType = {}));
export var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CARD"] = "card";
    PaymentMethod["ONLINE"] = "online";
    PaymentMethod["EXCHANGE"] = "exchange";
    PaymentMethod["ADVANCE"] = "advance";
    PaymentMethod["BAJAJ_EMI"] = "bajaj_emi";
})(PaymentMethod || (PaymentMethod = {}));
export var TransferStatus;
(function (TransferStatus) {
    TransferStatus["DRAFT"] = "draft";
    TransferStatus["INITIATED"] = "initiated";
    TransferStatus["IN_TRANSIT"] = "in_transit";
    TransferStatus["RECEIVED"] = "received";
    TransferStatus["REJECTED"] = "rejected";
})(TransferStatus || (TransferStatus = {}));
export var OnlineOrderStatus;
(function (OnlineOrderStatus) {
    OnlineOrderStatus["PENDING_PAYMENT"] = "pending_payment";
    OnlineOrderStatus["PAYMENT_CONFIRMED"] = "payment_confirmed";
    OnlineOrderStatus["PROCESSING"] = "processing";
    OnlineOrderStatus["PACKED"] = "packed";
    OnlineOrderStatus["SHIPPED"] = "shipped";
    OnlineOrderStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    OnlineOrderStatus["DELIVERED"] = "delivered";
    OnlineOrderStatus["CANCELLED"] = "cancelled";
    OnlineOrderStatus["RETURN_REQUESTED"] = "return_requested";
    OnlineOrderStatus["RETURNED"] = "returned";
})(OnlineOrderStatus || (OnlineOrderStatus = {}));
export var EkycStatus;
(function (EkycStatus) {
    EkycStatus["PENDING"] = "pending";
    EkycStatus["VERIFIED"] = "verified";
    EkycStatus["REJECTED"] = "rejected";
})(EkycStatus || (EkycStatus = {}));
export var CustomerType;
(function (CustomerType) {
    CustomerType["WALK_IN"] = "walk-in";
    CustomerType["ONLINE"] = "online";
    CustomerType["CORPORATE"] = "corporate";
    CustomerType["DEALER"] = "dealer";
})(CustomerType || (CustomerType = {}));
export var ReturnType;
(function (ReturnType) {
    ReturnType["SALE"] = "sale";
    ReturnType["PURCHASE"] = "purchase";
})(ReturnType || (ReturnType = {}));
export var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["WHATSAPP"] = "whatsapp";
    NotificationChannel["SMS"] = "sms";
    NotificationChannel["PUSH"] = "push";
    NotificationChannel["IN_APP"] = "in_app";
})(NotificationChannel || (NotificationChannel = {}));
//# sourceMappingURL=index.js.map