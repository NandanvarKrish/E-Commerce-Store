**E-Commerce Store – App Flow**

**1. Overview**

The E-Commerce Store follows two primary user flows:

Customer Flow – browsing products, shopping, managing the cart, placing orders, and managing the account.

Admin Flow – managing products, categories, inventory, orders, users, and store analytics.

The application also includes an AI Shopping Assistant powered by the Gemini API to help customers discover and understand products.

**2. Customer App Flow**

**2.1 Landing / Home**

The customer enters the application through the Home page.

**Main sections:**

Navigation Bar

Hero Section

Featured Products

Product Categories

Trending Products

AI Shopping Assistant

Brand / Editorial Section

Newsletter / CTA

Footer

**Flow:**

Home → Browse Products / Search / Categories / AI Assistant

**2.2 Product Discovery**

Customers can discover products through multiple methods.

**Options:**

Browse all products

Browse by category

Search products

Apply filters

Sort products

View featured or trending products

**Flow:**

Product Discovery → Product Listing → Product Details

**2.3 Product Listing**

The Product Listing page displays available products based on the customer's selected category, search query, filters, or sorting options.

**Features:**

Product image

Product name

Brand

Category

Price

Discount / comparison price

Rating

Availability

Wishlist

Quick Add / Quick View

**Flow:**

Product Listing → Select Product → Product Details

**2.4 Product Details**

The Product Details page provides complete information about a selected product.

**Information:**

Product images / gallery

Product name

Brand

Category

Price

Discount

Description

Product variants

Availability

Inventory status

Specifications

Ratings

Reviews

Related products

Recommended products

**Customer Actions:**

Add to Cart

Add to Wishlist

Select Variant

View Reviews

View Related Products

**Flow:**

Product Details → Add to Cart → Cart

Product Details → Add to Wishlist → Wishlist

**3. Search Flow**

Customers can search for products using the global search system.

**Flow:**

Search → Enter Query → Search Results → Apply Filters / Sorting → Select Product → Product Details

**Search Features:**

Product name search

Category-based search

Brand search

Search suggestions

Recent searches where applicable

Filtering and sorting

**4. Wishlist Flow**

Customers can save products for later.

**Flow:**

Product Details → Add to Wishlist → Wishlist

**Wishlist Actions:**

View saved products

Remove product

Move product to Cart

Continue Shopping

**5. Cart Flow**

The Cart contains all products selected by the customer.

**Cart Features:**

Product list

Product image

Product name

Selected variant

Quantity controls

Remove item

Subtotal

Shipping amount

Discount where applicable

Total amount

The system must prevent customers from ordering quantities greater than the available inventory.

**Flow:**

Add to Cart → Cart → Review Items → Update Quantity → Checkout

**6. Checkout Flow**

The Checkout process collects the required information to create an order.

**Steps:**

Customer Information

Shipping Address

Order Review

Final Order Calculation

Place Order

**Important:**

The current MVP does not include an online payment gateway. Therefore, there is no fake or placeholder payment screen.

**Flow:**

Cart → Checkout → Customer Information → Shipping Address → Order Review → Place Order

**7. Order Flow**

After the customer places an order, the system creates an order record.

**Flow:**

Place Order → Order Created → Order Confirmation → Order Details → Order History

**Order Status:**

Pending → Confirmed → Processing → Shipped → Delivered

An order may also be marked as:

Cancelled

**8. Customer Account Flow**

Customers can manage their personal account after authentication.

**Account Sections:**

Profile

Orders

Wishlist

Addresses

Settings

Logout

**Flow:**

Account → Profile / Orders / Wishlist / Addresses / Settings

**9. Authentication Flow**

Authentication is handled using Supabase Auth.

**New Customer:**

Register → Create Account → Login → Home / Account

**Existing Customer:**

Login → Authentication → Home / Account

**Additional Authentication Features:**

Logout

Session management

Password recovery

Protected customer routes

Role-based access

**10. AI Shopping Assistant Flow**

The application includes an AI Shopping Assistant powered by the Gemini API.

The AI assistant is designed to support the shopping experience rather than replace the normal store interface.

**Example Uses:**

Product discovery

Product recommendations

Product comparisons

Product information

Shopping guidance

Natural-language product queries

**Flow:**

Customer Query → AI Shopping Assistant → Server/API Layer → Store/Product Context → Gemini API → Validated Response → Customer

The Gemini API key must remain on the server-side and must never be exposed directly in the client application.

If the AI service becomes unavailable, the core shopping functionality must continue working normally.

**11. Admin App Flow**

The Admin section is available only to authorized administrators.

**Flow:**

Admin Login → Authentication → Admin Dashboard

**12. Admin Dashboard**

The Admin Dashboard provides an overview of the store.

**Dashboard Information:**

Total Products

Total Orders

Total Customers

Inventory Status

Recent Orders

Low Stock Products

Store Analytics

**Flow:**

Admin Dashboard → Products / Categories / Inventory / Orders / Users / Analytics

**13. Product Management Flow**

Administrators can manage the store's product catalog.

**Actions:**

Create Product

View Product

Edit Product

Delete / Deactivate Product

Upload Product Images

Manage Variants

Update Product Information

**Flow:**

Admin Dashboard → Products → Add / Edit / Manage Product

**14. Category Management Flow**

Administrators can create and manage product categories.

**Actions:**

Create Category

Edit Category

Activate / Deactivate Category

Update Category Information

Upload Category Image

**Flow:**

Admin Dashboard → Categories → Manage Categories

**15. Inventory Management Flow**

Administrators can monitor and update product inventory.

**Features:**

Current stock

Reserved quantity

Available quantity

Low-stock threshold

Inventory updates

Low-stock indicators

**Flow:**

Admin Dashboard → Inventory → View Stock → Update Inventory

**16. Order Management Flow**

Administrators can manage customer orders.

**Actions:**

View orders

View order details

View customer information

View ordered products

Update order status

Cancel orders where applicable

**Flow:**

Admin Dashboard → Orders → Select Order → Order Details → Update Status

**17. User Management Flow**

Administrators can view and manage registered customers.

**Information:**

Customer profile

Account status

Order history

Registration information

User role

**Flow:**

Admin Dashboard → Users → Select Customer → View Customer Information

**18. Complete Application Flow**

The complete application flow can be summarized as:

Visitor
↓
Home Page
↓
Browse / Search / Categories
↓
Product Listing
↓
Product Details
↓
┌───────────────────────┐
│ │
Add to Wishlist Add to Cart
│ │
Wishlist Cart
│ │
│ Checkout
│ │
│ Customer Info
│ │
│ Shipping Address
│ │
│ Order Review
│ │
│ Place Order
│ │
│ Order Confirmation
│ │
└──────────────→ Customer Account
│
┌─────────┼─────────┐
↓ ↓ ↓
Profile Orders Addresses

AI Shopping Assistant can be accessed throughout the shopping journey to assist with product discovery and recommendations.

**19. Admin Flow Summary**

Admin Login
↓
Admin Dashboard
↓
┌────────────┬────────────┬────────────┬────────────┬────────────┐
│ │ │ │ │
Products Categories Inventory Orders Users
│ │ │ │ │
CRUD Manage Stock Status Manage
│ │ │ │ │
└────────────┴────────────┴────────────┴────────────┴────────────┘
│
Analytics

**20. Final MVP Flow**

The final MVP focuses on a complete shopping experience without unnecessary complexity.

**Customer:**

Home → Browse/Search → Product → Cart/Wishlist → Checkout → Place Order → Order Confirmation → Account/Orders

**Admin:**

Admin Login → Dashboard → Products → Categories → Inventory → Orders → Users → Analytics

**AI:**

Customer → AI Assistant → Server/API → Gemini → Product-Grounded Response → Customer

**Backend:**

React Application → Supabase Auth → Server/API → PostgreSQL / Storage

The application is designed to be scalable so that future features such as payment gateways, coupons, advanced recommendations, shipping integration, notifications, and additional AI capabilities can be added without redesigning the core application architecture.
