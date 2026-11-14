/**
 * Lakhani Collection — Instant Offline / Pre-loaded Catalog Data
 * Ensures storefront renders immediately without getting stuck on "Loading..."
 */

window.INITIAL_SETTINGS = {
  "storeName": "Lakhani Collection",
  "proprietor": "Fahad",
  "whatsappNumber": "03302043491",
  "alternatePhone": "03112227142",
  "meezanBankTitle": "Fahad",
  "meezanBankNo": "1036 0113829648",
  "easypaisaTitle": "Fahad Fahad",
  "easypaisaNo": "03302043491",
  "opayTitle": "Fahad",
  "opayNo": "03302043491",
  "standardDeliveryFee": 250,
  "freeShippingThreshold": 4000,
  "noticeText": "⚠️ ONLY ADVANCE PAYMENT ACCEPTED — NATIONWIDE FAST DISPATCH IN PAKISTAN"
};

window.INITIAL_PRODUCTS = [
  {
    "id": "tracksuit",
    "title": "Men's Winter Fleece Baggy Tracksuit",
    "category": "men",
    "categoryLabel": "Men's Wear",
    "badge": "Bestseller",
    "badgeColor": "bg-blue-900/90 text-blue-300 border-blue-700",
    "originalPrice": 2499,
    "price": 2000,
    "aiImage": "assets/products/ai_tracksuit_men.jpg",
    "colorsImage": "assets/products/tracksuit_colors.jpg",
    "flyerImage": "assets/flyers/tracksuit_flyer.jpg",
    "fabric": "Winter Fleece (Soft & Heavyweight)",
    "description": "Winter stylish printed baggy trouser and sweatshirt tracksuit set. Features premium winter fleece fabric, trendy Arabic 'Musafir' back print, adjustable waistband drawstring, and ribbed cuffs.",
    "specs": [
      { "label": "Fabric", "val": "Winter Fleece (Warm)" },
      { "label": "Fit", "val": "Baggy Trouser + Sweatshirt" },
      { "label": "Trouser Length", "val": "39 / 40 Inches" }
    ],
    "sizes": [
      { "name": "Medium", "desc": "Chest: 20\" | L: 26\"" },
      { "name": "Large", "desc": "Chest: 21\" | L: 28\"" },
      { "name": "XL", "desc": "Chest: 22\" | L: 29\"" }
    ],
    "colors": ["White", "Black", "Baby Pink", "Lavender", "Maroon", "Beige", "Navy Blue"],
    "stock": 45
  },
  {
    "id": "pashmina",
    "title": "Luxury Pashmina Embroidered 3-Piece Winter Suit",
    "category": "women",
    "categoryLabel": "Women's Luxury",
    "badge": "Pure Pashmina",
    "badgeColor": "bg-amber-900/90 text-amber-300 border-amber-700",
    "originalPrice": 4500,
    "price": 3800,
    "aiImage": "assets/products/ai_pashmina_women.jpg",
    "colorsImage": "assets/products/pashmina_colors.jpg",
    "flyerImage": "assets/flyers/pashmina_flyer.jpg",
    "fabric": "Self Wool Bara Arz + Pure Pashmina Shawl",
    "description": "Premium Winter Pashmina Embroidery Collection. Features self wool bara arz suit with applic gala embroidery and heavy 72-grade pure pashmina jacquard 4-sided border shawl.",
    "specs": [
      { "label": "Suit Fabric", "val": "Self Wool Bara Arz" },
      { "label": "Shawl", "val": "72 Grade Pure Pashmina" }
    ],
    "sizes": [
      { "name": "Unstitched 3-Piece", "desc": "Full 3-Piece Fabric" }
    ],
    "colors": ["Camel Beige", "Royal Maroon", "Midnight Navy"],
    "stock": 20
  },
  {
    "id": "aliza_flora",
    "title": "Aliza Flora Leopard Digital Lawn 3-Piece Suit",
    "category": "women",
    "categoryLabel": "Designer Lawn",
    "badge": "Trending",
    "badgeColor": "bg-purple-900/90 text-purple-300 border-purple-700",
    "originalPrice": 3600,
    "price": 3050,
    "aiImage": "assets/products/ai_aliza_flora.jpg",
    "colorsImage": "assets/products/aliza_flora_colors.jpg",
    "flyerImage": "assets/flyers/aliza_flora_flyer.jpg",
    "fabric": "100% Original Digital Printed Fabric",
    "description": "100% Original Aliza Flora by Jazmine Collection 2026. Designer animal and leopard motifs on breathable cotton lawn with matching printed dupatta.",
    "specs": [
      { "label": "Shirt", "val": "Airjet Digital Lawn" },
      { "label": "Dupatta", "val": "Soft Voil Dupatta" }
    ],
    "sizes": [
      { "name": "Unstitched 3-Piece", "desc": "Complete 3-Piece" }
    ],
    "colors": ["Leopard Brown", "Zebra Mustard", "Monochrome"],
    "stock": 35
  },
  {
    "id": "cambric",
    "title": "Sapphire Cambric Stitched 3-Piece Suit",
    "category": "women",
    "categoryLabel": "Stitched Suits",
    "badge": "Stitched",
    "badgeColor": "bg-emerald-900/90 text-emerald-300 border-emerald-700",
    "originalPrice": 4200,
    "price": 3500,
    "aiImage": "assets/products/ai_cambric_women.jpg",
    "colorsImage": "assets/products/cambric_colors.jpg",
    "flyerImage": "assets/flyers/cambric_flyer.jpg",
    "fabric": "Sapphire Platinum Cambric (Vol-4)",
    "description": "Ready-to-wear stitched 3-piece cambric collection with delicate lace detailing on neckline, printed lawn dupatta, and dyed trouser.",
    "specs": [
      { "label": "Quality", "val": "Platinum Cambric Stitched" }
    ],
    "sizes": [
      { "name": "Medium", "desc": "Chest: 21\" | L: 38\"" },
      { "name": "Large", "desc": "Chest: 23\" | L: 40\"" }
    ],
    "colors": ["Sky Blue", "Brown", "Mustard", "Mint Green", "Peach Pink", "Teal", "Black & Red", "Maroon"],
    "stock": 28
  },
  {
    "id": "firdous_lawn",
    "title": "Firdous Lawn Cutwork Embroidered 3-Piece Suit",
    "category": "women",
    "categoryLabel": "Embroidered Lawn",
    "badge": "Heavy Cutwork",
    "badgeColor": "bg-rose-900/90 text-rose-300 border-rose-700",
    "originalPrice": 3800,
    "price": 3150,
    "aiImage": "assets/products/ai_firdous_lawn.jpg",
    "colorsImage": "assets/products/firdous_lawn_colors.jpg",
    "flyerImage": "assets/flyers/firdous_lawn_flyer.jpg",
    "fabric": "90/70 Airjet Pure Lawn with Cutwork Chikankari",
    "description": "Firdous Luxury Summer Collection 2026. Features heavy cutwork embroidered neck & daman, printed lawn back & sleeves, and embroidered cutwork dupatta.",
    "specs": [
      { "label": "Fabric", "val": "90/70 Airjet Cotton Lawn" },
      { "label": "Work", "val": "Heavy Cutwork Chikankari" }
    ],
    "sizes": [
      { "name": "Unstitched 3-Piece", "desc": "Full 3-Piece" }
    ],
    "colors": ["Pink Rose", "Powder Blue", "Lemon Yellow", "Sage Green"],
    "stock": 30
  },
  {
    "id": "farshi_suit",
    "title": "Party Wear Embroidered Kurti & Farshi Shalwar",
    "category": "women",
    "categoryLabel": "Semi Formal",
    "badge": "Farshi Cut",
    "badgeColor": "bg-indigo-900/90 text-indigo-300 border-indigo-700",
    "originalPrice": 2800,
    "price": 2250,
    "aiImage": "assets/products/ai_farshi_suit.jpg",
    "colorsImage": "assets/products/farshi_suit_colors.jpg",
    "flyerImage": "assets/flyers/farshi_suit_flyer.jpg",
    "fabric": "Heavy Pure Linen & Aerobin Fabric",
    "description": "Designer 2-piece readymade outfit with exquisite multi-color sequin and thread embroidered kurti paired with wide flared Farshi shalwar.",
    "specs": [
      { "label": "Kurti Chest", "val": "20.5 / 21 Inches" },
      { "label": "Kurti Length", "val": "36 / 37 Inches" },
      { "label": "Shalwar Length", "val": "38 / 39 Inches" }
    ],
    "sizes": [
      { "name": "Medium", "desc": "Chest: 20.5\" | L: 36\"" },
      { "name": "Large", "desc": "Chest: 21.5\" | L: 37\"" }
    ],
    "colors": ["Ruby Red", "Emerald Green", "Mustard Gold", "Midnight Navy", "Black"],
    "stock": 25
  },
  {
    "id": "sweater",
    "title": "T&H China Wool Long Cardigan Sweater",
    "category": "women",
    "categoryLabel": "Winter Knitwear",
    "badge": "Imported Wool",
    "badgeColor": "bg-teal-900/90 text-teal-300 border-teal-700",
    "originalPrice": 2500,
    "price": 1950,
    "aiImage": "assets/products/ai_sweater_women.jpg",
    "colorsImage": "assets/products/sweater_colors.jpg",
    "flyerImage": "assets/flyers/sweater_flyer.jpg",
    "fabric": "China Imported Cashmere Wool Blend (Ultra Soft)",
    "description": "T&H Long Sweater (Article: L2S2W0) with diamond knit embroidery, front buttons, and side pockets. Free size fit.",
    "specs": [
      { "label": "Chest", "val": "Up to 21 Inches" },
      { "label": "Length", "val": "30 Inches" }
    ],
    "sizes": [
      { "name": "Free Size", "desc": "Chest: Up to 21\"" }
    ],
    "colors": ["Dark Brown", "Maroon", "Navy Blue", "Dark Purple"],
    "stock": 22
  },
  {
    "id": "hoodie",
    "title": "Customized Name Fleece Zipper Hoodie",
    "category": "women",
    "categoryLabel": "Hoodies",
    "badge": "Custom Name",
    "badgeColor": "bg-pink-900/90 text-pink-300 border-pink-700",
    "originalPrice": 2200,
    "price": 1700,
    "aiImage": "assets/products/ai_hoodie_women.jpg",
    "colorsImage": "assets/products/hoodie_colors.jpg",
    "flyerImage": "assets/flyers/hoodie_flyer.jpg",
    "fabric": "Heavy Fleece (Waterproof DTF Print)",
    "description": "Women's stylish zipper hoodie with customizable name & heart crown print. Water-proof and heat-resistant DTF print.",
    "specs": [
      { "label": "Print", "val": "Water & Heat Proof DTF" }
    ],
    "sizes": [
      { "name": "Medium", "desc": "Chest: 20\"" },
      { "name": "Large", "desc": "Chest: 21\"" },
      { "name": "XL", "desc": "Chest: 22\"" }
    ],
    "colors": ["Baby Pink", "Navy Blue", "Grey", "Maroon", "Black"],
    "stock": 40
  },
  {
    "id": "handbag",
    "title": "2-Piece Luxury Handbag & Matching Wallet",
    "category": "bags",
    "categoryLabel": "Handbags",
    "badge": "2-in-1 Set",
    "badgeColor": "bg-amber-900/90 text-amber-300 border-amber-700",
    "originalPrice": 2200,
    "price": 1550,
    "aiImage": "assets/products/ai_handbag_set.jpg",
    "colorsImage": "assets/products/handbag_colors.jpg",
    "flyerImage": "assets/flyers/handbag_flyer.jpg",
    "fabric": "PU Leather with Golden Hardware",
    "description": "2-Piece Ladies Handbag Set (Ted Baker Style). Includes spacious structured handbag, matching travel wallet, and long shoulder belt.",
    "specs": [
      { "label": "Set", "val": "Handbag + Matching Wallet" }
    ],
    "sizes": [
      { "name": "Standard Set", "desc": "Handbag + Wallet" }
    ],
    "colors": ["Black", "Maroon", "Khaki", "Taupe", "Mint", "Cream", "Navy", "Dusty Pink", "Light Pink", "Tan"],
    "stock": 60
  },
  {
    "id": "bangle_ring",
    "title": "Fancy Zircon Flower Bangle & Ring Set",
    "category": "accessories",
    "categoryLabel": "Jewelry",
    "badge": "2-Pc Jewelry",
    "badgeColor": "bg-rose-900/90 text-rose-300 border-rose-700",
    "originalPrice": 1200,
    "price": 750,
    "aiImage": "assets/products/ai_jewelry_bangle.jpg",
    "colorsImage": "assets/products/bangle_ring_colors.jpg",
    "flyerImage": "assets/flyers/bangle_ring_flyer.jpg",
    "fabric": "Gold Finish with Sparkling Zircon Crystals",
    "description": "Openable Bangle and Adjustable Matching Ring for Her (Article: J2J5SF) with multi-faceted flower petals.",
    "specs": [
      { "label": "Fit", "val": "Openable Bangle + Adjustable Ring" }
    ],
    "sizes": [
      { "name": "Free Size", "desc": "Universal Fit" }
    ],
    "colors": ["Ruby Red", "White", "Peach", "Multi"],
    "stock": 85
  },
  {
    "id": "slippers",
    "title": "Designer Embellished Flat Slippers",
    "category": "accessories",
    "categoryLabel": "Footwear",
    "badge": "Sale Offer",
    "badgeColor": "bg-red-900/90 text-red-300 border-red-700",
    "originalPrice": 1800,
    "price": 1300,
    "aiImage": "assets/products/ai_slippers_flat.jpg",
    "colorsImage": "assets/products/slippers_colors.jpg",
    "flyerImage": "assets/flyers/slippers_flyer.jpg",
    "fabric": "Cushioned Insole & Anti-Slip Outsole",
    "description": "Ladies flat chappals/mules in 8 stylish variants: Silver Glitter Braided, Black Beaded, Blue Metallic, Leopard, and Tan.",
    "specs": [
      { "label": "Sole", "val": "Comfort Cushioned Sole" }
    ],
    "sizes": [
      { "name": "36", "desc": "UK 3" },
      { "name": "37", "desc": "UK 4" },
      { "name": "38", "desc": "UK 5" },
      { "name": "39", "desc": "UK 6" },
      { "name": "40", "desc": "UK 7" },
      { "name": "41", "desc": "UK 8" }
    ],
    "colors": ["Silver Glitter", "Black Beaded", "Blue", "Leopard", "Tan Brown", "Pink Bow"],
    "stock": 50
  }
];
