# Playground examples

Copy these into the GraphQL Playground at <http://localhost:3000/graphql>. Together they walk through the whole flow, from a new vendor to a paid order and a refund.

Most operations need a token. Put it in the **HTTP HEADERS** panel at the bottom of the Playground:

```json
{ "Authorization": "Bearer <accessToken>" }
```

Messages and the `name` and `description` fields are returned in Arabic by default. Add `"Accept-Language": "en"` to the headers, or `?lang=en` to the URL, for English.

All amounts are in **cents**: `price: 2500` means 25.00 USD.

## 1. Log in as the admin

The admin is created by the migrations (username `admin`, password `ADMIN_PASSWORD`).

```graphql
mutation {
  login(input: { emailOrUsername: "admin", password: "your-admin-password" }) {
    accessToken
    user { id username role }
  }
}
```

## 2. Create a category (admin)

```graphql
mutation {
  createCategory(input: { nameAr: "إلكترونيات", nameEn: "Electronics" }) {
    id
    name
  }
}
```

## 3. Register a vendor, then approve it (admin)

```graphql
mutation {
  registerVendor(input: {
    username: "techstore"
    fullname: "Tech Store Owner"
    email: "vendor@example.com"
    password: "Passw0rd!"
    storeName: "Tech Store"
    description: "Phones and accessories"
  })
}
```

A new vendor is `Pending` and cannot sell yet. With the **admin** token:

```graphql
query {
  vendors(status: Pending) {
    data { id storeName status commissionRate }
  }
}

mutation {
  approveVendor(vendorId: 1) { id status reviewedAt }
}
```

`rejectVendor(vendorId: 1, input: { reason: "..." })` rejects it instead. `setVendorCommission(vendorId: 1, commissionRate: 12.5)` changes its commission.

## 4. Add a product (vendor)

Log in as the vendor (`emailOrUsername: "techstore"`) and use that token:

```graphql
mutation {
  createProduct(input: {
    nameAr: "سماعات"
    nameEn: "Headphones"
    descriptionEn: "Wireless, noise cancelling"
    price: 2500
    stock: 10
    categoryId: 1
  }) {
    id
    name
    price
    stock
  }
}
```

### Add an image to it

1. Ask for an upload link:

   ```graphql
   mutation {
     createProductImageUpload(productId: 1, contentType: JPEG) {
       url
       fields
       key
       expiresAt
     }
   }
   ```

2. Upload the file straight to S3. Send every entry of `fields` as a form field, then the file last:

   ```bash
   curl -X POST "<url>" \
     -F "key=<fields.key>" \
     -F "Content-Type=image/jpeg" \
     -F "<every other field from fields>" \
     -F "file=@photo.jpg"
   ```

3. Save it on the product:

   ```graphql
   mutation {
     addProductImages(productId: 1, keys: ["<key>"]) {
       id
       images { id url }
     }
   }
   ```

## 5. Browse and search (no token needed)

```graphql
query {
  products(search: "headphones", minPrice: 1000, maxPrice: 5000, sortBy: price, order: ASC) {
    total
    data { id name price inStock vendor { storeName } }
  }
}
```

Search works in Arabic and English, and with mixed text.

## 6. Shop and check out (client)

```graphql
mutation {
  registerClient(input: {
    username: "sara"
    fullname: "Sara Ali"
    email: "sara@example.com"
    password: "Passw0rd!"
  })
}
```

Log in as `sara`, then:

```graphql
mutation {
  addToCart(productId: 1, quantity: 2) {
    total
    items { product { name } quantity lineTotal available }
  }
}

mutation {
  checkout(shippingAddress: "12 Nile St, Cairo") {
    id
    total
    status
    paymentIntentId
    clientSecret
    orders { id vendorId total commissionAmount status paymentStatus }
  }
}
```

The checkout makes one order per vendor in the cart and reserves the stock. It stays `Pending` until Stripe confirms the payment. Calling `checkout` again while it is pending returns the same checkout.

To pay without a frontend, use the `paymentIntentId` with the Stripe CLI. See [Stripe webhooks](../README.md#stripe-webhooks) in the README.

## 7. Follow the order

```graphql
query {
  myOrders {
    data {
      id
      status
      paymentStatus
      total
      items { nameEn quantity priceAtPurchase }
      history { status createdAt }
    }
  }
}
```

The vendor moves it forward (vendor token):

```graphql
mutation {
  updateOrderStatus(orderId: 1, status: Shipped) { id status }
}
```

The client can cancel while it is still `Pending`, with `cancelOrder(orderId: 1)`.

## 8. Money (vendor and admin)

```graphql
# vendor
query {
  myWallet {
    type
    balance
    transactions { data { type amount orderId createdAt } }
  }
}
```

```graphql
# admin
mutation {
  refundOrder(orderId: 1) { id status paymentStatus refundedAt }
}

mutation {
  payoutVendor(vendorId: 1, amount: 1000) { id type amount }
}

query {
  allTransactions(type: Sale) {
    data { walletId type amount orderId paymentIntentId }
  }
}
```

## 9. Reviews, follows, wishlist (client)

```graphql
mutation {
  createReview(vendorId: 1, rating: 5, comment: "Fast delivery") { id rating }
}

mutation {
  followVendor(vendorId: 1) { storeName followersCount }
}

mutation {
  addToWishlist(productId: 1) { id name }
}
```

## 10. Popular products and vendors (no token needed)

```graphql
query {
  popularProducts(from: "2026-01-01T00:00:00Z", limit: 5) {
    data { totalQuantity product { id name } }
  }
}

query {
  popularVendors(limit: 5) {
    data { score salesCount vendor { storeName averageRating } }
  }
}
```

How these are ranked is explained in [Design notes](../README.md#popularity) in the README.
