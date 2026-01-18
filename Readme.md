


<!-- 
  Project strucuture 
  /backend
  ├── /config             # Database connection, Environment variables
  ├── /controllers        # Handles request/response logic
  ├── /models             # Mongoose Schemas (The 4 we finalized)
  ├── /routes             # Express route definitions
  ├── /services           # Business logic (e.g., ProductService.js)
  ├── /middlewares        # Auth, Error handling, File upload
  ├── /utils              # Helper functions (SKU generators, etc.)
  ├── /uploads            # Local storage for images (temporary)
  ├── server.js           # Entry point
  └── .env                # Secrets and Config

 -->


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
        "Solid rubber outsole"
    ],
    // Hierarchical category IDs for fast filtering
    category_ids: [ObjectId("abc"), ObjectId("pqr")], 
    
    // Grouped by color so you don't repeat images for every size
    color_styles: [
        {
            color_name: "University Red",
            hex_code: "#CC0000",
            gallery: ["red_1.jpg", "red_2.jpg"], 
            is_default: true
        },
        {
            color_name: "Black/White",
            hex_code: "#000000",
            gallery: ["bw_1.jpg", "bw_2.jpg"],
            is_default: false
        }
    ],
    storytelling: [
        { type: "video", url: "promo.mp4", headline: "Flight Reimagined" },
        { type: "image_text", url: "detail.jpg", text: "Premium Craftsmanship" }
    ],
    timestamps: { created_at: Date, updated_at: Date }
}

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
        percentage: 18
    },
    country_of_origin: "Vietnam",
    is_active: true
}


const Category = {
    _id: ObjectId("pqr"),
    name: "Running",
    slug: "running-shoes",
    parent_category_id: ObjectId("abc"), // null for top-level
    description: "Shoes built for performance and speed.",
    filter_group_id: ObjectId("fg_001"), // Link to the specific filters
    level: 1, // 0 for Shoes, 1 for Running, 2 for Road Running
    image: "cat_thumb.jpg"
}

const Filter_Group = {
    _id: ObjectId("fg_001"),
    name: "Shoe Filters",
    filters: [
        {
            key: "size",
            label: "Size",
            ui_type: "button_grid", // Frontend uses this to pick a component
            options: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]
        },
        {
            key: "color",
            label: "Color",
            ui_type: "color_swatch",
            options: ["Red", "Blue", "Black", "White"]
        },
        {
            key: "gender",
            label: "Gender",
            ui_type: "checkbox",
            options: ["Men", "Women", "Unisex"]
        }
    ]
}

```

<!--  next step is to create an admin Product upload api -->








