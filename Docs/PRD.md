**Product Requirements Document (PRD)**

**Full-Stack E-Commerce Store**

**Version:** 1.0
**Project Status:** Development
**MVP:** Yes
**Payment Gateway:** Not included in MVP
**AI:** Gemini API

**1. Product Overview**

The project is a modern, full-stack e-commerce web application designed to provide a complete online shopping experience while demonstrating production-level frontend, backend, database, authentication, AI integration, and deployment practices.

The platform will allow customers to discover products, search and filter products, view detailed product information, manage their cart and wishlist, place orders, and manage their accounts.

An administrative dashboard will allow store administrators to manage products, categories, inventory, users, and orders.

The application will also integrate **Google Gemini API** to provide AI-powered shopping assistance and other intelligent features.

**Important:** Online payment processing will not be implemented in the MVP. The architecture should remain ready for future payment-gateway integration.

**2. Product Goals**

**Primary Goals**

Build a complete full-stack e-commerce platform.

Provide a modern, responsive, premium UI.

Implement secure authentication and authorization.

Use Supabase as the backend platform.

Use PostgreSQL as the primary database.

Integrate Gemini API for AI functionality.

Build a dedicated admin dashboard.

Implement proper database security using Row Level Security.

Create a scalable and maintainable architecture.

Containerize the application using Docker.

Make the application deployment-ready.

**Secondary Goals**

Make the project portfolio-quality.

Follow modern development practices.

Keep the codebase modular and reusable.

Make future features easy to integrate.

Design the application so payment integration can be added later.

**3. Target Users**

**3.1 Customers**

Customers should be able to:

Register and log in.

Browse products.

Search products.

Filter and sort products.

View product details.

Add products to their cart.

Manage their wishlist.

Place orders.

Track orders.

Manage their profile.

Interact with the AI shopping assistant.

**3.2 Administrators**

Administrators should be able to:

Manage products.

Manage categories.

Manage inventory.

Manage orders.

Manage customers.

View store statistics.

Manage featured products.

**4. Core User Journey**

Landing Page

↓

Product Discovery

↓

Search / Filter / Category

↓

Product Details

↓

Add to Cart / Wishlist

↓

Shopping Cart

↓

Checkout

↓

Create Order

↓

Order Confirmation

↓

Order Tracking

**5. Authentication**

Authentication will be handled using **Supabase Auth**.

**Required Features**

User registration.

User login.

User logout.

Session persistence.

Password recovery.

Protected routes.

Role-based access.

Customer accounts.

Administrator accounts.

**User Roles**

customer

admin

Administrators must have access to protected admin routes and functionality that regular customers cannot access.

**6. Home Page**

The home page should include:

Brand identity.

Navigation bar.

Hero section.

Featured products.

Popular products.

Product categories.

Promotional sections.

AI shopping assistant.

Footer.

Responsive navigation.

The design should prioritize product discovery and visual hierarchy.

**7. Product Catalog**

Customers must be able to browse the complete product catalog.

**Features**

Product grid.

Product cards.

Category browsing.

Search.

Filtering.

Sorting.

Pagination or equivalent loading mechanism.

Product availability indicators.

Ratings/reviews where available.

**Filters**

Potential filters:

Category.

Price range.

Rating.

Availability.

Brand.

Product attributes.

The filtering architecture should be extensible.

**8. Product Details**

Each product page should display:

Product images.

Product name.

Price.

Discount.

Description.

Category.

Brand.

Availability.

Inventory information.

Product specifications.

Ratings.

Reviews.

Add to Cart button.

Wishlist button.

Related products.

Recommended products.

**9. Search**

The search system should support:

Product name search.

Keyword search.

Category-aware search.

Search suggestions where practical.

Empty search results handling.

Future versions may introduce semantic/vector-based search.

**10. Shopping Cart**

Customers must be able to:

Add products.

Remove products.

Increase quantity.

Decrease quantity.

View item count.

View subtotal.

View total.

Continue shopping.

Proceed to checkout.

The system must prevent customers from purchasing quantities greater than available inventory.

Cart data should be persisted for authenticated users.

Client-side calculations must not be trusted for final order totals.

**11. Wishlist**

Customers must be able to:

Add products to wishlist.

Remove products.

View saved products.

Move products from wishlist to cart.

Wishlist records must belong to the authenticated user.

**12. Checkout**

The MVP checkout process will collect:

Customer information.

Shipping address.

Order items.

Product quantities.

Order total.

**Payment**

Online payment is **not included in the MVP**.

Instead, checkout will create an order record in the database.

The database architecture should allow future integration with:

Razorpay.

Stripe.

Other payment providers.

**13. Orders**

Customers should be able to:

View order history.

View individual orders.

View order items.

View quantities.

View total amount.

View order status.

**Order Status**

pending

confirmed

processing

shipped

delivered

cancelled

The system should allow additional statuses in future versions.

**14. Customer Dashboard**

The customer dashboard should include:

Profile.

Account settings.

Addresses.

Order history.

Wishlist.

Saved information.

**15. Admin Dashboard**

The admin dashboard will be used to manage the entire store.

**Dashboard Overview**

Display:

Total products.

Total customers.

Total orders.

Order value.

Pending orders.

Low-stock products.

Recent orders.

Basic analytics.

**16. Product Management**

Administrators must be able to:

Create products.

Edit products.

Delete/archive products.

Upload product images.

Set prices.

Set discounts.

Set inventory.

Assign categories.

Edit descriptions.

Manage specifications.

Mark products as featured.

**17. Category Management**

Administrators must be able to:

Create categories.

Edit categories.

Delete/archive categories.

Assign products to categories.

**18. Inventory Management**

Administrators should be able to:

View stock levels.

Update inventory.

Identify low-stock products.

Identify out-of-stock products.

Manage product availability.

Future versions may include inventory history and automated stock alerts.

**19. Order Management**

Administrators must be able to:

View all orders.

Search orders.

Filter orders.

View order details.

View customer information.

Update order status.

**20. User Management**

Administrators should be able to:

View customers.

View customer profiles.

Manage user roles where authorized.

Restrict accounts where appropriate.

Sensitive authentication information must never be exposed.

**21. AI Integration**

The application will use the **Google Gemini API**.

**21.1 AI Shopping Assistant**

The AI assistant should help customers:

Understand products.

Ask product-related questions.

Compare products.

Find suitable products.

Understand specifications.

Discover categories.

Get shopping guidance.

AI responses should be grounded in actual store/product data whenever product-specific information is provided.

**22. AI Product Recommendations**

Gemini may be used to recommend products based on:

User requirements.

Budget.

Category.

Product attributes.

Product specifications.

Available catalog.

The system must avoid inventing products or product specifications.

**23. AI Admin Tools**

Gemini may assist administrators with:

Product description generation.

Product description improvement.

Product summaries.

Feature highlights.

Marketing copy.

AI-generated content must remain editable before publishing.

**24. AI Security**

Gemini API credentials must never be exposed in client-side code.

AI requests should be handled through a secure server-side layer.

The application should implement:

Input validation.

Error handling.

Rate limiting where appropriate.

Secure API-key management.

**25. Database**

The application will use **Supabase PostgreSQL**.

**Core Tables**

profiles

categories

products

product_images

product_variants

inventory

wishlists

wishlist_items

carts

cart_items

addresses

orders

order_items

reviews

Additional tables can be introduced as required.

**Main Relationships**

User

├── Profile

├── Addresses

├── Cart

├── Wishlist

├── Orders

└── Reviews

Category

└── Products

Product

├── Images

├── Variants

├── Inventory

├── Reviews

└── Order Items

**26. Security**

Security is a core requirement.

The application must:

Use Supabase Authentication.

Use Row Level Security.

Protect admin routes.

Validate user input.

Validate API requests.

Protect Gemini API keys.

Protect database access.

Prevent cross-user data access.

Validate inventory quantities.

Validate final order totals server-side.

Secure uploaded files.

Use environment variables.

Never expose Supabase service-role credentials to the browser.

**27. UI/UX Design**

The visual identity should feel:

Modern.

Premium.

Natural.

Warm.

Clean.

Minimal.

Product-focused.

Elegant.

Responsive.

The design should avoid:

Excessive gradients.

Excessive glassmorphism.

Generic AI interfaces.

Overly futuristic visuals.

Excessive animations.

Template-like dashboards.

Unnecessary visual clutter.

**28. Typography**

The application will use four primary fonts.

Typography should maintain a clear hierarchy throughout the application.

**29. Color Palette**

The official brand palette is:

**CSS Variables**

:root {

--olive-leaf: #606c38;

--black-forest: #283618;

--cornsilk: #fefae0;

--sunlit-clay: #dda15e;

--copperwood: #bc6c25;

}

**Suggested Usage**

Black Forest → Navigation, headings, dark surfaces

Cornsilk     → Main background

Olive Leaf   → Primary actions and accents

Sunlit Clay  → Highlights and secondary actions

Copperwood   → Strong CTAs, alerts and emphasis

**30. Responsive Design**

The application must work across:

Mobile.

Tablet.

Laptop.

Desktop.

Responsive behavior should be intentionally designed for each screen size.

Important responsive areas:

Navigation.

Product grids.

Product details.

Cart.

Checkout.

Customer dashboard.

Admin dashboard.

Tables.

Modals.

AI assistant.

**31. Technical Architecture**

**Frontend**

**React + TypeScript**

Responsibilities:

UI.

Routing.

Components.

Client-side state.

User interactions.

Product browsing.

Customer dashboard.

Admin dashboard.

**Backend**

**Supabase**

Responsibilities:

PostgreSQL database.

Authentication.

Row Level Security.

Storage.

Backend services.

Database operations.

**AI**

**Google Gemini API**

Responsibilities:

AI shopping assistant.

Product recommendations.

Product-content generation.

Future intelligent features.

**Deployment**

**Docker**

Docker will be used to containerize the application where appropriate.

The project should support:

Development

↓

Docker Build

↓

Production Container

↓

Cloud Deployment

The final hosting provider can be selected according to the final application architecture.

**32. Environment Variables**

Sensitive configuration must be stored using environment variables.

Example:

SUPABASE_URL=

SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

The service-role key and Gemini API key must remain server-side.

**33. Performance Requirements**

The application should:

Optimize images.

Lazy-load non-critical assets.

Minimize unnecessary API requests.

Use efficient database queries.

Use pagination for large datasets.

Minimize unnecessary React renders.

Provide loading states.

Provide error states.

Provide empty states.

Maintain reasonable bundle sizes.

**34. Accessibility**

The application should follow modern accessibility practices.

Requirements:

Semantic HTML.

Keyboard navigation.

Visible focus states.

Accessible forms.

Descriptive buttons.

Proper labels.

Appropriate ARIA attributes.

Meaningful image alt text.

Adequate color contrast.

**35. Loading States**

Important areas should have dedicated loading states.

Examples:

Product skeletons.

Product detail loading.

Dashboard skeletons.

Button loading states.

AI response loading state.

Image upload progress.

**36. Empty States**

The application should provide meaningful empty states for:

Empty cart.

Empty wishlist.

No search results.

No orders.

Empty category.

No products.

No notifications where applicable.

**37. Error Handling**

The system must gracefully handle:

Authentication errors.

Database errors.

Network errors.

Invalid forms.

Out-of-stock products.

Invalid quantities.

Failed uploads.

AI failures.

Unauthorized requests.

Missing products.

Server errors.

Internal errors must never expose:

API keys.

Database credentials.

Stack traces.

Sensitive implementation details.

**38. SEO**

Public product and category pages should support:

Meaningful page titles.

Meta descriptions.

Semantic headings.

Clean URLs.

Product metadata.

Open Graph metadata where applicable.

**39. Analytics**

The admin dashboard should provide basic analytics such as:

Orders over time.

Product sales.

Order value.

Popular products.

Inventory status.

Recent orders.

Analytics should respect user privacy.

**40. Future Scope**

The following features are outside the MVP but should remain possible in the architecture.

**Payments**

Razorpay.

Stripe.

**AI**

Advanced recommendations.

Semantic search.

Vector database.

AI visual search.

Voice shopping assistant.

Personalized AI shopping.

**Store**

Coupons.

Discount codes.

Loyalty program.

Product subscriptions.

Multiple sellers.

Shipping integrations.

Delivery tracking.

Email notifications.

SMS notifications.

**Analytics**

Advanced sales analytics.

Customer analytics.

Inventory forecasting.

AI-powered business insights.

**41. MVP Scope**

**Included**

React frontend.

TypeScript.

Supabase backend.

PostgreSQL database.

Supabase Authentication.

Product catalog.

Categories.

Product details.

Search.

Filtering.

Cart.

Wishlist.

Checkout.

Order creation.

Order history.

Customer profile.

Admin dashboard.

Product management.

Category management.

Inventory management.

Order management.

Gemini API integration.

Responsive design.

Row Level Security.

Docker support.

**Not Included in MVP**

Online payments.

Advanced vector search.

Advanced recommendation engine.

Shipping-provider integration.

Loyalty program.

Multi-vendor marketplace.

Advanced analytics.

**42. Definition of Done**

The MVP will be considered complete when:

Customers can register and log in.

Customers can browse products.

Customers can search and filter products.

Customers can view product details.

Customers can add/remove/update cart items.

Customers can manage their wishlist.

Customers can complete checkout without online payment.

Orders are securely stored in Supabase.

Customers can view their order history.

Customers can manage their profile.

Administrators can access the admin dashboard.

Administrators can manage products.

Administrators can manage categories.

Administrators can manage inventory.

Administrators can manage orders.

Gemini AI functionality works securely.

Supabase RLS protects user data.

The application is responsive.

Environment variables are securely configured.

The application can be built and deployed using the production setup.

No critical security or functionality issues remain.

**43. Project Principles**

The project should follow three core principles:

**1. Build Like a Real Product**

The application should not be treated as a simple demo project.

**2. Security First**

Authentication, authorization, database policies, API security, and sensitive credentials must be handled properly.

**3. Build for the Next Version**

The MVP should remain simple, but the architecture should allow future additions such as payments, advanced AI, personalization, analytics, and scaling.

**Build the store like a real product, not just a demo.**

| Font | Usage |
| --- | --- |
| Abel | Primary UI and body text |
| Roboto Mono | Prices, metadata, technical information |
| Courgette | Decorative/accent text |
| Berkshire Swash | Brand/display typography |

| Name | CSS Variable | Hex |
| --- | --- | --- |
| Olive Leaf | --olive-leaf | #606c38 |
| Black Forest | --black-forest | #283618 |
| Cornsilk | --cornsilk | #fefae0 |
| Sunlit Clay | --sunlit-clay | #dda15e |
| Copperwood | --copperwood | #bc6c25 |
