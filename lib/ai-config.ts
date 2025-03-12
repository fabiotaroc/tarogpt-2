export const tableSchema = `
# table name: bluelagoon_skincare_consulting_prod.moe_new

## columns: 

order_code: unique order code
order_date: order date
order_status: status of the order (only use it to query if explicitly asked for). options: [complete, fulfilled, in_transit, shipped, accepted_by_logistic, sent_to_logistic, exception, out_for_delivery, partial, pending, processing, not_be_delivered]
transaction_website: ecommerce website location. can be either us (american), en (european), or is (icelandic)
product_sku: sku of the item. unique identifier
item_name: name of the specific item with size
product_name: the generic item name without the size
product_category: category of product. options: [body & hand, masks, gifts & sets, moisturizers, hair, eye & lip, other, spa at home, cleansers, serums]
product_line: either spa, derma, bl+, or spa&bl+
product_quantity: quantity of that item bought
product_revenue_euro_notax: relevant revenue information. always use this column when asked for revenue or average order value. it is already net of discounts and taxes.
order_currency: currency of the order
order_taxrate:tax rate percentage
gift: whether the item is a gift or not_gift
bundles_and_sets: whether bundle_or_set or not_bundle_or_set
discount_vat_excluded_euro: discount on the item in euro
catalogue_price_notax: original catalogue price of the item
order_hashedemail: unique identifier of a customer. this is what is meant by customer
gender: gender of the customer. options: [male, female, NULL]
order_number: how many orders that customer placed in his lifetime
customer_type: "New" or "Repeat" customer
shipping_cost_euro: shipping cost. customers are the ones paying
order_country: country the order is placed from and will be shipped to, full name (e.g. United Kingdom, United States, etc...)
order_region: region the order is placed from and will be shipped to
order_city: city the order is placed from and will be shipped to
order_payment_subcategory: generic payment method (credit card, alternative method)
payment_method: specific payment provider (adyen, paypal, channable)
order_coupon_magentorule: coupon name. used for campaigns and promotions
order_coupon_code: alphanumeric code for each to coupon name
source_medium: traffic source and traffic medium
first_level_source: generic source category, and commonly referred to as just 'source'. Options: [Email, Marketing, Direct, Organic, Referral, SMS, Other, [NULL]]
campaign: name of the campaign the customer comes from
landing_page_path: landing page the customer lands on

## Composite Primary Key: order_code and product_sku

## Rules
- When counting orders, always count distinct order_code
- For SELECT DISTINCT, ORDER BY expressions must appear in select list
`;
