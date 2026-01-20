


# catalog?
A catalog is an organized list or database of items, products, or data, often with descriptions and details, used for browsing, ordering, or finding information, common in retail (e.g., IKEA catalog), libraries (book catalog), and technology (data catalog), providing structure and simplifying discovery. It can be a physical book or a digital system, helping users find what they need efficiently. 

# inventory?
the products those are not sold yet and the raw material that is being used or will be used in falls under the inventory

# SKU?
Stock Keeping Unit is a unique product like for a jordan 1 the sku will be its unique product having  color and size as unique values and this tracks the quantity of the product i.e stock so it called stock keeping unit 


Project strucuture
/backend
├── /config # Database connection, Environment variables
├── /controllers # Handles request/response logic
├── /models # Mongoose Schemas (The 4 we finalized)
├── /routes # Express route definitions
├── /services # Business logic (e.g., ProductService.js)
├── /middlewares # Auth, Error handling, File upload
├── /utils # Helper functions (SKU generators, etc.)
├── /uploads # Local storage for images (temporary)
├── server.js # Entry point
└── .env # Secrets and Config

```js
const Product = {
  _id: ObjectId,
  name: "Jordan 1 Retro High OG",
  brand: "Nike",
  base_price: 15995, // Default price shown on listing
  description: "Iconic style meets modern comfort...",
  details: [
    "Genuine leather upper",
    "Air-Sole unit in the heel",
    "Solid rubber outsole",
  ],
  // Hierarchical category IDs for fast filtering
  category_ids: [ObjectId("abc"), ObjectId("pqr")],

  // Grouped by color so you don't repeat images for every size
  color_styles: [
    {
      color_name: "University Red",
      hex_code: "#CC0000",
      gallery: ["red_1.jpg", "red_2.jpg"],
      is_default: true,
    },
    {
      color_name: "Black/White",
      hex_code: "#000000",
      gallery: ["bw_1.jpg", "bw_2.jpg"],
      is_default: false,
    },
  ],
  storytelling: [
    { type: "video", url: "promo.mp4", headline: "Flight Reimagined" },
    { type: "image_text", url: "detail.jpg", text: "Premium Craftsmanship" },
  ],
  timestamps: { created_at: Date, updated_at: Date },
};

const Product_SKU = {
  _id: ObjectId,
  product_id: ObjectId("jordan-1-main"), // Reference to Product
  sku_code: "J1-RED-UK10",
  size: "UK 10",
  color: "University Red", // Matches the color_name in Product
  price: 15995, // Actual price (can vary by size/color)
  stock: 25,
  tax_info: {
    is_inclusive: true,
    percentage: 18,
  },
  country_of_origin: "Vietnam",
  is_active: true,
};

const Category = {
  _id: ObjectId("pqr"),
  name: "Running",
  slug: "running-shoes",
  parent_category_id: ObjectId("abc"), // null for top-level
  description: "Shoes built for performance and speed.",
  filter_group_id: ObjectId("fg_001"), // Link to the specific filters
  level: 1, // 0 for Shoes, 1 for Running, 2 for Road Running
  image: "cat_thumb.jpg",
};

const Filter_Group = {
  _id: ObjectId("fg_001"),
  name: "Shoe Filters",
  filters: [
    {
      key: "size",
      label: "Size",
      ui_type: "button_grid", // Frontend uses this to pick a component
      options: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    },
    {
      key: "color",
      label: "Color",
      ui_type: "color_swatch",
      options: ["Red", "Blue", "Black", "White"],
    },
    {
      key: "gender",
      label: "Gender",
      ui_type: "checkbox",
      options: ["Men", "Women", "Unisex"],
    },
  ],
};
```

<!--  next step is to create an admin Product upload api -->

# creating the admin api's for product

1. /products --> Create a new Shoe model + initial SKUs (The "Super-Route").
2. /products/:id ---> Update general info (Name, Description, Storytelling).
3. /skus  --> Add a single new size or color to an existing shoe.
4. /skus/:id  --> Update price or stock for a specific size (e.g., restock UK 10).
5. /products/:id/colors  --> Add a new color gallery to the Product master.


# create api for filter_group and category
1. api/admin/filters  --> add the filter
2. api/admin/categories  --> add the category




# importance of version controll in the api 

Skipping versioning (/v1) is a bit like building a house but sealing the doors so you can never move the furniture. It works perfectly on day one, but it makes future changes extremely painful.

Here are three real-world scenarios that can happen in an e-commerce project if you don't use version control:

1. The "Mobile App Crash" Scenario
Imagine you have a website and a mobile app both using your API.

Today: Your Product API returns an array of strings for images: images: ["1.jpg", "2.jpg"].

Tomorrow: You want to upgrade to your "Color Group" logic, so you change the API to return objects: images: [{ url: "1.jpg", color: "Red" }].

The Disaster: You push this change to the server. Your website works because you updated the code there. However, the mobile app (which users haven't updated yet) is still expecting strings. It tries to read a string, finds an object, and instantly crashes for thousands of users.

With v1/v2: You keep the old logic on /v1 for the mobile app and put the new logic on /v2 for the website.

2. The "Database Migration" Lockdown
Suppose you decide to move your ProductSKU data into the Product document (complete denormalization) to make the site faster.

Without v1: Every single service, frontend component, and third-party tool (like an inventory tracker) that hits your API will break the moment you change the JSON structure. You are "locked" into your old database design because you're too afraid to break the app.

With v1: You can build a completely new database architecture and point /api/v2/ to it, while /api/v1/ continues to translate the new data into the old format for older parts of your system.

3. Third-Party Integration Breaks
As you grow, you might give a delivery partner or a marketing tool access to your /api/admin/products endpoint so they can sync your stock.

The Conflict: You want to add a mandatory field like tax_category to your product upload.

The Problem: Your delivery partner's script doesn't know about this new field. Since the field is now "Required" in your backend, their automated sync starts failing every night. You can't fix their code because you don't own it.

# api/admin/products
# api/admin/prducts/:id

