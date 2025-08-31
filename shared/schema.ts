import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb, serial, pgEnum, date, unique, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export enterprise data schema
export * from "./schema/enterpriseData";

// Enums
export const userRole = pgEnum('user_role', ['cliente', 'vendedor', 'admin']);
export const kycStatus = pgEnum('kyc_status', ['pending', 'approved', 'rejected']);
export const material = pgEnum('material', ['silver_925', 'silver_950']);
export const orderStatus = pgEnum('order_status', ['created', 'paid', 'shipped', 'delivered', 'cancelled']);
export const payoutStatus = pgEnum('payout_status', ['pending', 'paid', 'failed']);
export const shipmentStatus = pgEnum('shipment_status', ['label_created', 'in_transit', 'delivered']);
export const disputeReason = pgEnum('dispute_reason', ['not_received', 'damaged', 'not_as_described']);
export const disputeStatus = pgEnum('dispute_status', ['open', 'under_review', 'resolved_buyer', 'resolved_seller', 'refunded']);
export const fraudStatus = pgEnum('fraud_status', ['pending', 'approved', 'flagged', 'blocked']);
export const loyaltyPointType = pgEnum('loyalty_point_type', ['earned', 'redeemed', 'expired', 'bonus']);
export const moderationStatus = pgEnum('moderation_status', ['pending', 'approved', 'rejected']);
export const shippingCarrier = pgEnum('shipping_carrier', ['estafeta', 'dhl', 'fedex', '99minutos', 'paquetexpress']);
export const escrowStatus = pgEnum('escrow_status', ['held', 'released', 'refunded']);
export const mediaType = pgEnum('media_type', ['image', 'video', 'document', '360_render']);
export const chatFilterAction = pgEnum('chat_filter_action', ['allow', 'censor', 'block', 'flag']);
export const kycVerificationStatus = pgEnum('kyc_verification_status', ['unverified', 'pending', 'verified', 'rejected', 'platinum_verified']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  role: userRole("role").notNull().default("cliente"),
  isVerified: boolean("is_verified").default(false),
  verificationDocuments: jsonb("verification_documents"),
  avatar: text("avatar"),
  refreshToken: text("refresh_token"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Perfiles de vendedores
export const sellerProfiles = pgTable("seller_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  storeName: varchar("store_name", { length: 100 }).notNull(),
  bio: text("bio"),
  silverCheck: boolean("silver_check").default(false),
  kycStatus: kycStatus("kyc_status").default("pending"),
  kycDocs: jsonb("kyc_docs"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Direcciones de usuarios
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  line1: varchar("line1", { length: 255 }).notNull(),
  line2: varchar("line2", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  zip: varchar("zip", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull().default("México"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Wallets para balances de usuarios
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  balanceCents: integer("balance_cents").notNull().default(0),
  currency: varchar("currency", { length: 3 }).notNull().default("MXN"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Pagos a vendedores
export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  amountCents: integer("amount_cents").notNull(),
  status: payoutStatus("status").default("pending"),
  reference: varchar("reference", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  image: text("image"),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow()
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  material: material("material").notNull().default("silver_925"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  categoryId: integer("category_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  images: jsonb("images").notNull(), // array of image URLs
  specifications: jsonb("specifications"), // material, weight, dimensions, etc.
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  totalCents: integer("total_cents").notNull(),
  status: orderStatus("status").default("created"),
  shippingAddressId: integer("shipping_address_id").notNull(),
  paymentRef: varchar("payment_ref", { length: 100 }),
  paymentMethod: varchar("payment_method", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Envíos
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().unique(),
  carrier: varchar("carrier", { length: 100 }).notNull(),
  tracking: varchar("tracking", { length: 100 }),
  status: shipmentStatus("status").default("label_created"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Disputas
export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  openedById: integer("opened_by_id").notNull(),
  reason: disputeReason("reason").notNull(),
  status: disputeStatus("status").default("open"),
  notes: jsonb("notes"), // array of notes with timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Chat seguro
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().unique(),
  buyerId: integer("buyer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  locked: boolean("locked").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  redactions: jsonb("redactions"), // array of redacted patterns
  systemFlags: jsonb("system_flags"), // flags for censored content, etc.
  createdAt: timestamp("created_at").defaultNow()
});

// Auditoría
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorId: integer("actor_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 100 }).notNull(),
  entityId: integer("entity_id"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").defaultNow()
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  priceCents: integer("price_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderItemId: integer("order_item_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdBy: integer("created_by").notNull(),
  images: jsonb("images"), // array of review image URLs
  createdAt: timestamp("created_at").defaultNow()
});

export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const cart = pgTable("cart", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  sellerProfile: one(sellerProfiles),
  wallet: one(wallets),
  addresses: many(addresses),
  products: many(products),
  orders: many(orders),
  reviews: many(reviews),
  wishlist: many(wishlist),
  cart: many(cart),
  payouts: many(payouts),
  disputes: many(disputes),
  chatRoomsAsBuyer: many(chatRooms, { relationName: "buyer" }),
  chatRoomsAsSeller: many(chatRooms, { relationName: "seller" }),
  messages: many(messages),
  auditLogs: many(auditLogs),
  // Level 2 relations
  behaviorEvents: many(userBehavior),
  fraudScores: many(fraudScores),
  loyaltyAccount: one(userLoyalty),
  loyaltyTransactions: many(loyaltyPoints),
  recommendations: many(recommendations),
  // Level 3 relations
  searchQueries: many(searchQueries),
  interactions: many(userInteractions),
  chatSessions: many(chatSessions),
  apiKeys: many(apiKeys)
}));

export const sellerProfilesRelations = relations(sellerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [sellerProfiles.userId],
    references: [users.id]
  })
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id]
  })
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id]
  })
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  seller: one(users, {
    fields: [payouts.sellerId],
    references: [users.id]
  })
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id]
  }),
  children: many(categories),
  products: many(products)
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id]
  }),
  orderItems: many(orderItems),
  wishlist: many(wishlist),
  cart: many(cart),
  // Level 3 relations
  embeddings: one(productEmbeddings),
  interactions: many(userInteractions),
  artisans: many(productArtisans),
  searchClicks: many(searchQueries, { relationName: "clickedProduct" })
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id]
  }),
  items: many(orderItems),
  shipment: one(shipments),
  dispute: one(disputes),
  chatRoom: one(chatRooms)
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  }),
  review: one(reviews)
}));

export const shipmentsRelations = relations(shipments, ({ one }) => ({
  order: one(orders, {
    fields: [shipments.orderId],
    references: [orders.id]
  })
}));

export const disputesRelations = relations(disputes, ({ one }) => ({
  order: one(orders, {
    fields: [disputes.orderId],
    references: [orders.id]
  }),
  openedBy: one(users, {
    fields: [disputes.openedById],
    references: [users.id]
  })
}));

export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  order: one(orders, {
    fields: [chatRooms.orderId],
    references: [orders.id]
  }),
  buyer: one(users, {
    fields: [chatRooms.buyerId],
    references: [users.id],
    relationName: "buyer"
  }),
  seller: one(users, {
    fields: [chatRooms.sellerId],
    references: [users.id],
    relationName: "seller"
  }),
  messages: many(messages)
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  room: one(chatRooms, {
    fields: [messages.roomId],
    references: [chatRooms.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  })
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  orderItem: one(orderItems, {
    fields: [reviews.orderItemId],
    references: [orderItems.id]
  }),
  createdBy: one(users, {
    fields: [reviews.createdBy],
    references: [users.id]
  })
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, {
    fields: [wishlist.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [wishlist.productId],
    references: [products.id]
  })
}));

export const cartRelations = relations(cart, ({ one }) => ({
  user: one(users, {
    fields: [cart.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [cart.productId],
    references: [products.id]
  })
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id]
  })
}));

// ============ NIVEL 2: ANALYTICS AVANZADO ============
export const userBehavior = pgTable("user_behavior", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 100 }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // page_view, product_click, add_to_cart, purchase, etc
  eventData: jsonb("event_data"), // Additional event context
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fraud detection and risk scoring
export const fraudScores = pgTable("fraud_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  orderId: integer("order_id").references(() => orders.id),
  riskScore: integer("risk_score").notNull(), // 0-100, where 100 is highest risk
  riskFactors: jsonb("risk_factors"), // Array of risk indicators
  status: fraudStatus("status").default("pending"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ PROGRAMA DE LEALTAD ============
export const loyaltyTiers = pgTable("loyalty_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  minPoints: integer("min_points").notNull(),
  maxPoints: integer("max_points"),
  benefits: jsonb("benefits"), // Cashback %, free shipping, early access, etc
  badgeColor: varchar("badge_color", { length: 20 }),
  isActive: boolean("is_active").default(true),
});

export const userLoyalty = pgTable("user_loyalty", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  currentPoints: integer("current_points").default(0),
  totalEarned: integer("total_earned").default(0),
  totalRedeemed: integer("total_redeemed").default(0),
  tierId: integer("tier_id").references(() => loyaltyTiers.id),
  tierAchievedAt: timestamp("tier_achieved_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const loyaltyPoints = pgTable("loyalty_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  points: integer("points").notNull(),
  type: loyaltyPointType("type").notNull(),
  source: varchar("source", { length: 50 }), // purchase, referral, review, birthday, etc
  sourceId: integer("source_id"), // Reference to order, review, etc
  description: text("description"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ SISTEMA DE RESEÑAS VERIFICADAS ============
export const verifiedReviews = pgTable("verified_reviews", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => reviews.id).notNull(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  reviewImages: jsonb("review_images"), // Array of image URLs
  reviewVideo: varchar("review_video", { length: 255 }),
  helpfulVotes: integer("helpful_votes").default(0),
  sellerResponse: text("seller_response"),
  sellerResponseAt: timestamp("seller_response_at"),
  moderationStatus: moderationStatus("moderation_status").default("pending"),
  moderatedBy: integer("moderated_by").references(() => users.id),
  moderatedAt: timestamp("moderated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics aggregations for performance
export const dailyMetrics = pgTable("daily_metrics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  metric: varchar("metric", { length: 50 }).notNull(), // gmv, orders, new_users, etc
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  metadata: jsonb("metadata"),
}, (table) => ({
  uniqueDateMetric: unique().on(table.date, table.metric),
}));

// Product recommendations based on behavior
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  algorithm: varchar("algorithm", { length: 50 }).notNull(), // collaborative, content, hybrid
  context: jsonb("context"), // Page context, user preferences, etc
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// ============ NIVEL 3: AI AND ADVANCED FEATURES ============

// Search analytics and AI features
export const searchQueries = pgTable('search_queries', {
  id: serial('id').primaryKey(),
  query: text('query').notNull(),
  userId: integer('user_id').references(() => users.id),
  resultsCount: integer('results_count').default(0),
  clickedProductId: integer('clicked_product_id').references(() => products.id),
  searchType: varchar('search_type', { length: 50 }).default('text'), // 'text', 'voice', 'image', 'semantic'
  language: varchar('language', { length: 10 }).default('es'),
  location: text('location'), // For geo-based searches
  createdAt: timestamp('created_at').defaultNow()
});

// Product embeddings for semantic search
export const productEmbeddings = pgTable('product_embeddings', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).unique(),
  embedding: text('embedding').notNull(), // JSON array of vector embeddings
  features: jsonb('features'), // Extracted features: colors, materials, styles, etc
  tags: text('tags').array(), // AI-generated tags
  updatedAt: timestamp('updated_at').defaultNow()
});

// User behavior patterns for ML recommendations
export const userInteractions = pgTable('user_interactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  productId: integer('product_id').references(() => products.id),
  interactionType: varchar('interaction_type', { length: 50 }).notNull(), // 'view', 'like', 'share', 'add_to_cart', 'purchase'
  duration: integer('duration'), // Time spent viewing (in seconds)
  sessionId: varchar('session_id', { length: 100 }),
  deviceType: varchar('device_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow()
});

// AI chatbot conversations
export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  sessionToken: varchar('session_token', { length: 100 }).unique(),
  status: varchar('status', { length: 20 }).default('active'), // 'active', 'ended', 'escalated'
  language: varchar('language', { length: 10 }).default('es'),
  createdAt: timestamp('created_at').defaultNow(),
  endedAt: timestamp('ended_at')
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => chatSessions.id),
  sender: varchar('sender', { length: 20 }).notNull(), // 'user', 'ai', 'agent'
  message: text('message').notNull(),
  intent: varchar('intent', { length: 50 }), // 'product_inquiry', 'support', 'complaint', etc
  entities: jsonb('entities'), // Extracted entities: product names, prices, etc
  confidence: decimal('confidence', { precision: 3, scale: 2 }), // AI confidence score
  createdAt: timestamp('created_at').defaultNow()
});

// Artisan and regional data for advanced search
export const artisans = pgTable('artisans', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  bio: text('bio'),
  region: varchar('region', { length: 50 }).notNull(),
  state: varchar('state', { length: 50 }).notNull(),
  techniques: text('techniques').array(), // Traditional techniques used
  yearsOfExperience: integer('years_of_experience'),
  isVerified: boolean('is_verified').default(false),
  profileImage: text('profile_image'),
  createdAt: timestamp('created_at').defaultNow()
});

export const productArtisans = pgTable('product_artisans', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id),
  artisanId: integer('artisan_id').references(() => artisans.id),
  role: varchar('role', { length: 50 }).default('creator'), // 'creator', 'collaborator'
  createdAt: timestamp('created_at').defaultNow()
});

// API access and rate limiting - moved to Level 4 section

// Level 2 Relations
export const userBehaviorRelations = relations(userBehavior, ({ one }) => ({
  user: one(users, {
    fields: [userBehavior.userId],
    references: [users.id]
  })
}));

export const fraudScoresRelations = relations(fraudScores, ({ one }) => ({
  user: one(users, {
    fields: [fraudScores.userId],
    references: [users.id]
  }),
  order: one(orders, {
    fields: [fraudScores.orderId],
    references: [orders.id]
  }),
  reviewedBy: one(users, {
    fields: [fraudScores.reviewedBy],
    references: [users.id]
  })
}));

export const loyaltyTiersRelations = relations(loyaltyTiers, ({ many }) => ({
  users: many(userLoyalty)
}));

export const userLoyaltyRelations = relations(userLoyalty, ({ one, many }) => ({
  user: one(users, {
    fields: [userLoyalty.userId],
    references: [users.id]
  }),
  tier: one(loyaltyTiers, {
    fields: [userLoyalty.tierId],
    references: [loyaltyTiers.id]
  }),
  pointTransactions: many(loyaltyPoints)
}));

export const loyaltyPointsRelations = relations(loyaltyPoints, ({ one }) => ({
  user: one(users, {
    fields: [loyaltyPoints.userId],
    references: [users.id]
  })
}));

export const verifiedReviewsRelations = relations(verifiedReviews, ({ one }) => ({
  review: one(reviews, {
    fields: [verifiedReviews.reviewId],
    references: [reviews.id]
  }),
  order: one(orders, {
    fields: [verifiedReviews.orderId],
    references: [orders.id]
  }),
  moderatedBy: one(users, {
    fields: [verifiedReviews.moderatedBy],
    references: [users.id]
  })
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  user: one(users, {
    fields: [recommendations.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [recommendations.productId],
    references: [products.id]
  })
}));

// Level 3 Relations
export const searchQueriesRelations = relations(searchQueries, ({ one }) => ({
  user: one(users, {
    fields: [searchQueries.userId],
    references: [users.id]
  }),
  clickedProduct: one(products, {
    fields: [searchQueries.clickedProductId],
    references: [products.id],
    relationName: "clickedProduct"
  })
}));

export const productEmbeddingsRelations = relations(productEmbeddings, ({ one }) => ({
  product: one(products, {
    fields: [productEmbeddings.productId],
    references: [products.id]
  })
}));

export const userInteractionsRelations = relations(userInteractions, ({ one }) => ({
  user: one(users, {
    fields: [userInteractions.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [userInteractions.productId],
    references: [products.id]
  })
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id]
  }),
  messages: many(chatMessages)
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id]
  })
}));

export const artisansRelations = relations(artisans, ({ many }) => ({
  products: many(productArtisans)
}));

export const productArtisansRelations = relations(productArtisans, ({ one }) => ({
  product: one(products, {
    fields: [productArtisans.productId],
    references: [products.id]
  }),
  artisan: one(artisans, {
    fields: [productArtisans.artisanId],
    references: [artisans.id]
  })
}));

// API relations moved to Level 4 section

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  refreshToken: true,
  refreshTokenExpiresAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertSellerProfileSchema = createInsertSchema(sellerProfiles).omit({
  id: true,
  silverCheck: true,
  createdAt: true,
  updatedAt: true
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertDisputeSchema = createInsertSchema(disputes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});

export const insertCartSchema = createInsertSchema(cart).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true
});

// Level 2 Zod Schemas
export const insertUserBehaviorSchema = createInsertSchema(userBehavior).omit({
  id: true,
  createdAt: true
});

export const insertFraudScoreSchema = createInsertSchema(fraudScores).omit({
  id: true,
  reviewedAt: true,
  createdAt: true
});

export const insertLoyaltyTierSchema = createInsertSchema(loyaltyTiers).omit({
  id: true
});

export const insertUserLoyaltySchema = createInsertSchema(userLoyalty).omit({
  id: true,
  tierAchievedAt: true,
  updatedAt: true
});

export const insertLoyaltyPointsSchema = createInsertSchema(loyaltyPoints).omit({
  id: true,
  createdAt: true
});

export const insertVerifiedReviewSchema = createInsertSchema(verifiedReviews).omit({
  id: true,
  sellerResponseAt: true,
  moderatedAt: true,
  createdAt: true
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SellerProfile = typeof sellerProfiles.$inferSelect;
export type InsertSellerProfile = z.infer<typeof insertSellerProfileSchema>;

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;

export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;

export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = z.infer<typeof insertDisputeSchema>;

export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Category = typeof categories.$inferSelect;

export type Wishlist = typeof wishlist.$inferSelect;

export type Cart = typeof cart.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Level 2 Types
export type UserBehavior = typeof userBehavior.$inferSelect;
export type InsertUserBehavior = z.infer<typeof insertUserBehaviorSchema>;

export type FraudScore = typeof fraudScores.$inferSelect;
export type InsertFraudScore = z.infer<typeof insertFraudScoreSchema>;

export type LoyaltyTier = typeof loyaltyTiers.$inferSelect;
export type InsertLoyaltyTier = z.infer<typeof insertLoyaltyTierSchema>;

export type UserLoyalty = typeof userLoyalty.$inferSelect;
export type InsertUserLoyalty = z.infer<typeof insertUserLoyaltySchema>;

export type LoyaltyPoints = typeof loyaltyPoints.$inferSelect;
export type InsertLoyaltyPoints = z.infer<typeof insertLoyaltyPointsSchema>;

export type VerifiedReview = typeof verifiedReviews.$inferSelect;
export type InsertVerifiedReview = z.infer<typeof insertVerifiedReviewSchema>;

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;

export type DailyMetric = typeof dailyMetrics.$inferSelect;

// Level 3 Types
export type SearchQuery = typeof searchQueries.$inferSelect;
export type ProductEmbedding = typeof productEmbeddings.$inferSelect;
export type UserInteraction = typeof userInteractions.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type Artisan = typeof artisans.$inferSelect;
export type ProductArtisan = typeof productArtisans.$inferSelect;

// Level 4: Enterprise Features

// Enhanced vendor/marketplace management
export const vendors = pgTable('vendors', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  businessType: varchar('business_type', { length: 100 }).notNull(), // 'artisan', 'distributor', 'manufacturer'
  taxId: varchar('tax_id', { length: 100 }),
  businessRegistration: varchar('business_registration', { length: 255 }),
  
  // Business details
  description: text('description'),
  website: varchar('website', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  
  // Marketplace settings
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('5.00'), // Platform commission %
  subscriptionTier: varchar('subscription_tier', { length: 50 }).default('basic'), // 'basic', 'premium', 'enterprise'
  monthlyFee: integer('monthly_fee').default(0), // In cents
  
  // Status and verification
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'active', 'suspended', 'rejected'
  verificationLevel: varchar('verification_level', { length: 50 }).default('basic'), // 'basic', 'verified', 'premium'
  verifiedAt: timestamp('verified_at'),
  
  // Metrics
  totalSales: integer('total_sales').default(0), // In cents
  totalOrders: integer('total_orders').default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  responseTime: integer('response_time').default(24), // Hours
  
  // Settings
  autoAcceptOrders: boolean('auto_accept_orders').default(false),
  shippingPolicy: text('shipping_policy'),
  returnPolicy: text('return_policy'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Commission tracking
export const commissions = pgTable('commissions', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id).notNull(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  
  // Commission details
  orderAmount: integer('order_amount').notNull(), // Original order amount in cents
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).notNull(),
  commissionAmount: integer('commission_amount').notNull(), // Commission in cents
  vendorPayout: integer('vendor_payout').notNull(), // Amount paid to vendor in cents
  
  // Status tracking
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'paid', 'disputed'
  paidAt: timestamp('paid_at'),
  paymentMethod: varchar('payment_method', { length: 100 }),
  transactionId: varchar('transaction_id', { length: 255 }),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Business analytics and metrics
export const businessMetrics = pgTable('business_metrics', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id),
  
  // Time period
  period: varchar('period', { length: 50 }).notNull(), // 'daily', 'weekly', 'monthly', 'yearly'
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  
  // Sales metrics
  revenue: integer('revenue').default(0), // In cents
  orders: integer('orders').default(0),
  products_sold: integer('products_sold').default(0),
  average_order_value: integer('average_order_value').default(0),
  
  // Customer metrics
  new_customers: integer('new_customers').default(0),
  returning_customers: integer('returning_customers').default(0),
  customer_acquisition_cost: integer('customer_acquisition_cost').default(0),
  
  // Product metrics
  top_selling_category: varchar('top_selling_category', { length: 100 }),
  inventory_turnover: decimal('inventory_turnover', { precision: 5, scale: 2 }).default('0.00'),
  
  // Marketing metrics
  conversion_rate: decimal('conversion_rate', { precision: 5, scale: 2 }).default('0.00'),
  traffic: integer('traffic').default(0),
  ad_spend: integer('ad_spend').default(0),
  
  createdAt: timestamp('created_at').defaultNow()
});

// Automated marketing campaigns
export const marketingCampaigns = pgTable('marketing_campaigns', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id),
  
  // Campaign details
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(), // 'email', 'sms', 'push', 'social'
  status: varchar('status', { length: 50 }).default('draft'), // 'draft', 'active', 'paused', 'completed'
  
  // Targeting
  targetAudience: jsonb('target_audience'), // Segmentation rules
  triggerType: varchar('trigger_type', { length: 100 }), // 'scheduled', 'event_based', 'behavioral'
  triggerConditions: jsonb('trigger_conditions'),
  
  // Content
  subject: varchar('subject', { length: 255 }),
  content: text('content'),
  template: varchar('template', { length: 100 }),
  
  // Scheduling
  scheduledAt: timestamp('scheduled_at'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  
  // Performance metrics
  sent: integer('sent').default(0),
  delivered: integer('delivered').default(0),
  opened: integer('opened').default(0),
  clicked: integer('clicked').default(0),
  converted: integer('converted').default(0),
  revenue_generated: integer('revenue_generated').default(0),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Advanced inventory management
export const inventoryEvents = pgTable('inventory_events', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  vendorId: integer('vendor_id').references(() => vendors.id).notNull(),
  
  // Event details
  eventType: varchar('event_type', { length: 100 }).notNull(), // 'restock', 'sale', 'damage', 'return', 'adjustment'
  quantityChange: integer('quantity_change').notNull(), // Positive or negative
  previousQuantity: integer('previous_quantity').notNull(),
  newQuantity: integer('new_quantity').notNull(),
  
  // Context
  reason: varchar('reason', { length: 255 }),
  orderId: integer('order_id').references(() => orders.id),
  batchNumber: varchar('batch_number', { length: 100 }),
  supplierId: integer('supplier_id'),
  
  // Cost tracking
  unitCost: integer('unit_cost'), // In cents
  totalCost: integer('total_cost'), // In cents
  
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id)
});

// Fraud detection
export const fraudAlerts = pgTable('fraud_alerts', {
  id: serial('id').primaryKey(),
  
  // Target details
  targetType: varchar('target_type', { length: 50 }).notNull(), // 'order', 'user', 'payment'
  targetId: integer('target_id').notNull(),
  
  // Alert details
  alertType: varchar('alert_type', { length: 100 }).notNull(),
  riskScore: decimal('risk_score', { precision: 5, scale: 2 }).notNull(), // 0.00 to 100.00
  severity: varchar('severity', { length: 50 }).notNull(), // 'low', 'medium', 'high', 'critical'
  
  // Detection details
  detectionMethod: varchar('detection_method', { length: 100 }).notNull(), // 'rule_based', 'ml_model', 'manual'
  rulesTriggers: jsonb('rules_triggered'),
  additionalData: jsonb('additional_data'),
  
  // Status
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'investigating', 'resolved', 'false_positive'
  assignedTo: integer('assigned_to').references(() => users.id),
  resolution: text('resolution'),
  resolvedAt: timestamp('resolved_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Advanced Payment Processing Tables
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("MXN").notNull(),
  billingInterval: varchar("billing_interval", { length: 20 }).notNull(), // monthly, yearly
  features: jsonb("features"),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // card, bank_transfer, paypal, etc
  provider: varchar("provider", { length: 50 }).notNull(), // stripe, paypal, etc
  externalId: varchar("external_id", { length: 255 }),
  lastFour: varchar("last_four", { length: 4 }),
  brand: varchar("brand", { length: 50 }),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  isDefault: boolean("is_default").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const installmentPlans = pgTable("installment_plans", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  totalAmount: integer("total_amount").notNull(),
  installments: integer("installments").notNull(),
  installmentAmount: integer("installment_amount").notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).default("0.00"),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  nextPaymentDate: timestamp("next_payment_date"),
  completedPayments: integer("completed_payments").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const installmentPayments = pgTable("installment_payments", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").references(() => installmentPlans.id).notNull(),
  amount: integer("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  paymentIntentId: varchar("payment_intent_id", { length: 255 }),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// API Marketplace Tables
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  name: varchar("name", { length: 100 }).notNull(),
  keyHash: varchar("key_hash", { length: 255 }).notNull(),
  permissions: jsonb("permissions"),
  rateLimit: integer("rate_limit").default(1000),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  url: varchar("url", { length: 500 }).notNull(),
  events: jsonb("events").notNull(), // array of event types
  secret: varchar("secret", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  lastTriggeredAt: timestamp("last_triggered_at"),
  failureCount: integer("failure_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: serial("id").primaryKey(),
  webhookId: integer("webhook_id").references(() => webhooks.id).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: jsonb("payload").notNull(),
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  attempts: integer("attempts").default(1),
  deliveredAt: timestamp("delivered_at"),
  failedAt: timestamp("failed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// API Usage tracking table
export const apiUsage = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  apiKeyId: integer("api_key_id").references(() => apiKeys.id).notNull(),
  endpoint: varchar("endpoint", { length: 100 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  statusCode: integer("status_code"),
  responseTime: integer("response_time"), // in milliseconds
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// International Expansion Tables
export const currencies = pgTable("currencies", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 3 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).notNull(),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 2 }).notNull().unique(), // ISO 3166-1 alpha-2
  name: varchar("name", { length: 100 }).notNull(),
  currencyCode: varchar("currency_code", { length: 3 }).references(() => currencies.code),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0.00"),
  shippingZone: varchar("shipping_zone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  regulations: jsonb("regulations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull(),
  language: varchar("language", { length: 5 }).notNull(), // en, es, fr, etc
  value: text("value").notNull(),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// White-label Solutions Tables
export const brandConfigurations = pgTable("brand_configurations", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  brandName: varchar("brand_name", { length: 100 }).notNull(),
  logoUrl: varchar("logo_url", { length: 500 }),
  primaryColor: varchar("primary_color", { length: 7 }).default("#000000"),
  secondaryColor: varchar("secondary_color", { length: 7 }).default("#ffffff"),
  accentColor: varchar("accent_color", { length: 7 }).default("#007bff"),
  fontFamily: varchar("font_family", { length: 100 }).default("Inter"),
  customDomain: varchar("custom_domain", { length: 255 }),
  customCss: text("custom_css"),
  faviconUrl: varchar("favicon_url", { length: 500 }),
  metadata: jsonb("metadata"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const themeTemplates = pgTable("theme_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  previewUrl: varchar("preview_url", { length: 500 }),
  cssTemplate: text("css_template").notNull(),
  variables: jsonb("variables"), // customizable variables
  category: varchar("category", { length: 50 }),
  isPremium: boolean("is_premium").default(false),
  price: integer("price").default(0),
  downloads: integer("downloads").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Level 4 Types
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;

export type BusinessMetric = typeof businessMetrics.$inferSelect;
export type InsertBusinessMetric = z.infer<typeof insertBusinessMetricSchema>;

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;

export type InventoryEvent = typeof inventoryEvents.$inferSelect;
export type InsertInventoryEvent = z.infer<typeof insertInventoryEventSchema>;

export type FraudAlert = typeof fraudAlerts.$inferSelect;
export type InsertFraudAlert = z.infer<typeof insertFraudAlertSchema>;

// Advanced Payment Types
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type InstallmentPlan = typeof installmentPlans.$inferSelect;
export type InsertInstallmentPlan = z.infer<typeof insertInstallmentPlanSchema>;

export type InstallmentPayment = typeof installmentPayments.$inferSelect;
export type InsertInstallmentPayment = z.infer<typeof insertInstallmentPaymentSchema>;

// API Marketplace Types
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type InsertWebhookDelivery = z.infer<typeof insertWebhookDeliverySchema>;

export type ApiUsage = typeof apiUsage.$inferSelect;
export type InsertApiUsage = z.infer<typeof insertApiUsageSchema>;

// International Types
export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;

export type Country = typeof countries.$inferSelect;
export type InsertCountry = z.infer<typeof insertCountrySchema>;

export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;

// White-label Types
export type BrandConfiguration = typeof brandConfigurations.$inferSelect;
export type InsertBrandConfiguration = z.infer<typeof insertBrandConfigurationSchema>;

export type ThemeTemplate = typeof themeTemplates.$inferSelect;
export type InsertThemeTemplate = z.infer<typeof insertThemeTemplateSchema>;

// Level 4 Insert Schemas
export const insertVendorSchema = createInsertSchema(vendors);
export const insertCommissionSchema = createInsertSchema(commissions);
export const insertBusinessMetricSchema = createInsertSchema(businessMetrics);
export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns);
export const insertInventoryEventSchema = createInsertSchema(inventoryEvents);
export const insertFraudAlertSchema = createInsertSchema(fraudAlerts);

// Advanced Payment Insert Schemas
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const insertPaymentMethodSchema = createInsertSchema(paymentMethods);
export const insertInstallmentPlanSchema = createInsertSchema(installmentPlans);
export const insertInstallmentPaymentSchema = createInsertSchema(installmentPayments);

// API Marketplace Insert Schemas
export const insertApiKeySchema = createInsertSchema(apiKeys);
export const insertWebhookSchema = createInsertSchema(webhooks);
export const insertWebhookDeliverySchema = createInsertSchema(webhookDeliveries);
export const insertApiUsageSchema = createInsertSchema(apiUsage);

// International Insert Schemas
export const insertCurrencySchema = createInsertSchema(currencies);
export const insertCountrySchema = createInsertSchema(countries);
export const insertTranslationSchema = createInsertSchema(translations);

// White-label Insert Schemas
export const insertBrandConfigurationSchema = createInsertSchema(brandConfigurations);
export const insertThemeTemplateSchema = createInsertSchema(themeTemplates);

// PRIORIDAD 1: PARIDAD FUNCIONAL ROBUSTA

// 1. BÚSQUEDA FACETADA & CATÁLOGO AVANZADO
export const searchSynonyms = pgTable('search_synonyms', {
  id: serial('id').primaryKey(),
  term: varchar('term', { length: 100 }).notNull().unique(),
  synonyms: text('synonyms').array().notNull(), // ["plata 925", "plata sterling", "silver 925"]
  category: varchar('category', { length: 50 }), // 'material', 'technique', 'type'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const productSearchIndex = pgTable('product_search_index', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  searchVector: text('search_vector').notNull(), // Texto indexado para búsqueda
  facets: jsonb('facets').notNull(), // { "material": "925", "technique": "martillado", "origin": "taxco" }
  gramaje: integer('gramaje'), // Peso en gramos
  tallasAnillos: text('tallas_anillos').array(), // ["6", "7", "8", "9"]
  tecnicas: text('tecnicas').array(), // ["martillado", "oxidado", "pulido"]
  origen: varchar('origen', { length: 100 }), // "Taxco", "Guadalajara"
  lastIndexed: timestamp('last_indexed').defaultNow()
});

// 2. SISTEMA DE MEDIA AVANZADO (S3 + CDN)
export const productMedia = pgTable('product_media', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  type: mediaType('type').notNull(),
  originalUrl: text('original_url').notNull(), // S3 URL original
  webpUrl: text('webp_url'), // URL comprimida WebP
  avifUrl: text('avif_url'), // URL comprimida AVIF
  thumbnailUrl: text('thumbnail_url'), // Miniatura 150x150
  mediumUrl: text('medium_url'), // 600x600
  largeUrl: text('large_url'), // 1200x1200
  cdnUrl: text('cdn_url'), // URL del CDN
  alt: text('alt'), // Texto alternativo
  displayOrder: integer('display_order').default(0),
  zoomLevels: integer('zoom_levels').default(1), // 1=normal, 2=2x, 3=3x
  is360: boolean('is_360').default(false), // Render 360°
  sizeBytes: integer('size_bytes'),
  dimensions: jsonb('dimensions'), // { "width": 1200, "height": 1200 }
  metadata: jsonb('metadata'), // Metadatos adicionales
  createdAt: timestamp('created_at').defaultNow()
});

export const sizeGuides = pgTable('size_guides', {
  id: serial('id').primaryKey(),
  category: varchar('category', { length: 50 }).notNull(), // 'anillos', 'pulseras', 'collares'
  measurements: jsonb('measurements').notNull(), // Medidas por talla
  imageUrl: text('image_url'), // Imagen de la guía
  instructions: text('instructions'), // Instrucciones de medición
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// 3. STRIPE CONNECT + ESCROW
export const stripeConnectAccounts = pgTable('stripe_connect_accounts', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id).notNull().unique(),
  stripeAccountId: varchar('stripe_account_id', { length: 100 }).notNull().unique(),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  chargesEnabled: boolean('charges_enabled').default(false),
  payoutsEnabled: boolean('payouts_enabled').default(false),
  requirements: jsonb('requirements'), // Requisitos pendientes de Stripe
  capabilities: jsonb('capabilities'), // Capacidades habilitadas
  lastUpdated: timestamp('last_updated').defaultNow()
});

export const escrowTransactions = pgTable('escrow_transactions', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull().unique(),
  amountCents: integer('amount_cents').notNull(),
  platformFeeCents: integer('platform_fee_cents').notNull(),
  vendorAmountCents: integer('vendor_amount_cents').notNull(),
  status: escrowStatus('status').default('held'),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 100 }),
  stripeTransferId: varchar('stripe_transfer_id', { length: 100 }),
  heldAt: timestamp('held_at').defaultNow(),
  releasedAt: timestamp('released_at'),
  refundedAt: timestamp('refunded_at'),
  autoReleaseAt: timestamp('auto_release_at') // Auto liberación después de X días
});

// 4. ENVÍOS INTEGRADOS (Estafeta/DHL/99Minutos)
export const shippingRates = pgTable('shipping_rates', {
  id: serial('id').primaryKey(),
  carrier: shippingCarrier('carrier').notNull(),
  fromZip: varchar('from_zip', { length: 10 }).notNull(),
  toZip: varchar('to_zip', { length: 10 }).notNull(),
  weightGrams: integer('weight_grams').notNull(),
  serviceName: varchar('service_name', { length: 100 }).notNull(), // "Express", "Standard"
  costCents: integer('cost_cents').notNull(),
  deliveryDays: integer('delivery_days').notNull(),
  isAvailable: boolean('is_available').default(true),
  lastUpdated: timestamp('last_updated').defaultNow()
});

export const shipmentTracking = pgTable('shipment_tracking', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  carrier: shippingCarrier('carrier').notNull(),
  trackingNumber: varchar('tracking_number', { length: 100 }).notNull(),
  serviceName: varchar('service_name', { length: 100 }).notNull(),
  labelUrl: text('label_url'), // URL de la etiqueta
  rateCents: integer('rate_cents').notNull(),
  estimatedDelivery: timestamp('estimated_delivery'),
  status: shipmentStatus('status').default('label_created'),
  trackingEvents: jsonb('tracking_events'), // Historial de eventos
  webhookData: jsonb('webhook_data'), // Datos del webhook del carrier
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const vendorShippingSLA = pgTable('vendor_shipping_sla', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id).notNull(),
  promisedShipDays: integer('promised_ship_days').notNull().default(2), // Días para enviar
  promisedDeliveryDays: integer('promised_delivery_days').notNull().default(7), // Días total
  actualShipDays: decimal('actual_ship_days', { precision: 3, scale: 1 }), // Promedio real
  actualDeliveryDays: decimal('actual_delivery_days', { precision: 3, scale: 1 }),
  onTimeShipRate: decimal('on_time_ship_rate', { precision: 5, scale: 2 }), // % a tiempo
  onTimeDeliveryRate: decimal('on_time_delivery_rate', { precision: 5, scale: 2 }),
  lastCalculated: timestamp('last_calculated').defaultNow()
});

// 5. DISPUTAS Y RMA
export const disputeWorkflows = pgTable('dispute_workflows', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  buyerId: integer('buyer_id').references(() => users.id).notNull(),
  vendorId: integer('vendor_id').references(() => users.id).notNull(),
  reason: disputeReason('reason').notNull(),
  status: disputeStatus('status').default('open'),
  description: text('description').notNull(),
  requestedAmount: integer('requested_amount'), // Reembolso solicitado en centavos
  approvedAmount: integer('approved_amount'), // Reembolso aprobado en centavos
  evidenceUrls: text('evidence_urls').array(), // URLs de evidencias multimedia
  adminNotes: text('admin_notes'),
  autoResolveAt: timestamp('auto_resolve_at'), // Auto resolución si no hay respuesta
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at')
});

export const rmaRequests = pgTable('rma_requests', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  disputeId: integer('dispute_id').references(() => disputeWorkflows.id),
  returnType: varchar('return_type', { length: 50 }).notNull(), // 'refund', 'exchange', 'repair'
  reason: text('reason').notNull(),
  returnTrackingNumber: varchar('return_tracking_number', { length: 100 }),
  returnShippingLabel: text('return_shipping_label'),
  inspectionNotes: text('inspection_notes'),
  resolutionNotes: text('resolution_notes'),
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'approved', 'returned', 'completed'
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at')
});

// 6. MODERACIÓN DE CHAT (Sin contacto directo)
export const chatFilters = pgTable('chat_filters', {
  id: serial('id').primaryKey(),
  pattern: text('pattern').notNull(), // Regex pattern
  type: varchar('type', { length: 50 }).notNull(), // 'email', 'phone', 'social', 'url'
  action: chatFilterAction('action').notNull(),
  severity: integer('severity').default(1), // 1=bajo, 5=alto
  replacement: text('replacement'), // Texto de reemplazo para censura
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const chatModerationLog = pgTable('chat_moderation_log', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id').references(() => chatMessages.id).notNull(),
  filterId: integer('filter_id').references(() => chatFilters.id),
  originalText: text('original_text').notNull(),
  moderatedText: text('moderated_text'),
  action: chatFilterAction('action').notNull(),
  severity: integer('severity'),
  flaggedContent: text('flagged_content'), // El contenido específico detectado
  createdAt: timestamp('created_at').defaultNow()
});

export const chatAuditLog = pgTable('chat_audit_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  sessionId: integer('session_id').references(() => chatSessions.id).notNull(),
  action: varchar('action', { length: 50 }).notNull(), // 'message_sent', 'filter_triggered', 'user_warned'
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow()
});

// 7. PANEL ADMIN: KYC + KPIs
export const kycVerifications = pgTable('kyc_verifications', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id).notNull(),
  status: kycVerificationStatus('status').default('unverified'),
  level: varchar('level', { length: 50 }).default('basic'), // 'basic', 'verified', 'platinum'
  documentType: varchar('document_type', { length: 50 }), // 'ine', 'pasaporte', 'cedula'
  documentUrls: text('document_urls').array(),
  businessDocumentUrls: text('business_document_urls').array(),
  addressProofUrls: text('address_proof_urls').array(),
  reviewNotes: text('review_notes'),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  expiresAt: timestamp('expires_at'), // Verificación expira
  silverCheckAwarded: boolean('silver_check_awarded').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const adminKPIs = pgTable('admin_kpis', {
  id: serial('id').primaryKey(),
  date: date('date').notNull().unique(),
  
  // GMV (Gross Merchandise Value)
  gmvCents: integer('gmv_cents').default(0),
  
  // AOV (Average Order Value)
  aovCents: integer('aov_cents').default(0),
  totalOrders: integer('total_orders').default(0),
  
  // Conversión
  uniqueVisitors: integer('unique_visitors').default(0),
  conversions: integer('conversions').default(0),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 }).default('0.00'),
  
  // Disputas
  totalDisputes: integer('total_disputes').default(0),
  disputeRate: decimal('dispute_rate', { precision: 5, scale: 2 }).default('0.00'),
  
  // Tiempo a entrega
  avgDeliveryDays: decimal('avg_delivery_days', { precision: 4, scale: 1 }),
  onTimeDeliveryRate: decimal('on_time_delivery_rate', { precision: 5, scale: 2 }),
  
  // Vendedores
  activeVendors: integer('active_vendors').default(0),
  newVendorSignups: integer('new_vendor_signups').default(0),
  kycPendingCount: integer('kyc_pending_count').default(0),
  
  // Pagos
  vendorPayoutsCents: integer('vendor_payouts_cents').default(0),
  platformRevenueCents: integer('platform_revenue_cents').default(0),
  
  calculatedAt: timestamp('calculated_at').defaultNow()
});

export const vendorPayoutQueue = pgTable('vendor_payout_queue', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id).notNull(),
  amountCents: integer('amount_cents').notNull(),
  currency: varchar('currency', { length: 3 }).default('MXN'),
  escrowTransactionIds: text('escrow_transaction_ids').array(), // IDs de transacciones liberadas
  stripeTransferId: varchar('stripe_transfer_id', { length: 100 }),
  status: payoutStatus('status').default('pending'),
  failureReason: text('failure_reason'),
  scheduledAt: timestamp('scheduled_at'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// ============ PRIORIDAD 2: RETENCIÓN & CONVERSIÓN ============

// Sistema de recomendaciones híbridas
export const productRecommendations = pgTable('product_recommendations', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id),
  recommendedProductId: integer('recommended_product_id').references(() => products.id),
  type: varchar('type', { length: 50 }).notNull(), // collaborative, content, popularity, hybrid
  score: decimal('score', { precision: 5, scale: 4 }).notNull(),
  metadata: jsonb('metadata'), // razones de la recomendación
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Sistema de promociones
export const promotions = pgTable('promotions', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id),
  type: varchar('type', { length: 50 }).notNull(), // coupon, flash_deal, bundle, recurring
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  code: varchar('code', { length: 100 }), // para cupones
  discountType: varchar('discount_type', { length: 20 }).notNull(), // percentage, fixed_amount
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }),
  maxDiscountAmount: decimal('max_discount_amount', { precision: 10, scale: 2 }),
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').default(0),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  conditions: jsonb('conditions'), // condiciones específicas
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const flashDeals = pgTable('flash_deals', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }).notNull(),
  dealPrice: decimal('deal_price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  sold: integer('sold').default(0),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const promotionUsage = pgTable('promotion_usage', {
  id: serial('id').primaryKey(),
  promotionId: integer('promotion_id').references(() => promotions.id),
  userId: integer('user_id').references(() => users.id),
  orderId: integer('order_id').references(() => orders.id),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Sistema de reviews mejoradas (extiende las reviews existentes)
export const reviewHelpfulness = pgTable('review_helpfulness', {
  id: serial('id').primaryKey(),
  reviewId: integer('review_id').references(() => reviews.id),
  userId: integer('user_id').references(() => users.id),
  isHelpful: boolean('is_helpful').notNull(),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => [
  unique().on(table.reviewId, table.userId)
]);

export const reviewMedia = pgTable('review_media', {
  id: serial('id').primaryKey(),
  reviewId: integer('review_id').references(() => reviews.id),
  mediaType: varchar('media_type', { length: 20 }).notNull(), // photo, video
  url: varchar('url', { length: 500 }).notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  alt: varchar('alt', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow()
});

export const vendorReviewResponses = pgTable('vendor_review_responses', {
  id: serial('id').primaryKey(),
  reviewId: integer('review_id').references(() => reviews.id),
  vendorId: integer('vendor_id').references(() => vendors.id),
  response: text('response').notNull(),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Catálogo pro vendedor
export const inventoryManagement = pgTable('inventory_management', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id),
  variantId: integer('variant_id'), // para variantes del producto
  currentStock: integer('current_stock').default(0),
  reservedStock: integer('reserved_stock').default(0), // stock en órdenes pendientes
  reorderPoint: integer('reorder_point').default(5), // punto de reabastecimiento
  reorderQuantity: integer('reorder_quantity').default(10),
  supplier: varchar('supplier', { length: 255 }),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  lastRestocked: timestamp('last_restocked'),
  autoReorderEnabled: boolean('auto_reorder_enabled').default(false),
  lowStockAlert: boolean('low_stock_alert').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const productVariants = pgTable('product_variants', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id),
  name: varchar('name', { length: 255 }).notNull(), // ej: "Talla M", "Color Plata"
  sku: varchar('sku', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }),
  weight: decimal('weight', { precision: 8, scale: 2 }),
  dimensions: jsonb('dimensions'), // largo, ancho, alto
  attributes: jsonb('attributes'), // talla, color, material específico
  images: text('images').array(),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow()
});

export const shippingZones = pgTable('shipping_zones', {
  id: serial('id').primaryKey(),
  vendorId: integer('vendor_id').references(() => vendors.id),
  name: varchar('name', { length: 255 }).notNull(),
  zipCodes: text('zip_codes').array(), // códigos postales incluidos
  states: text('states').array(), // estados incluidos
  baseCost: decimal('base_cost', { precision: 10, scale: 2 }).notNull(),
  costPerKg: decimal('cost_per_kg', { precision: 10, scale: 2 }),
  freeShippingThreshold: decimal('free_shipping_threshold', { precision: 10, scale: 2 }),
  estimatedDays: integer('estimated_days').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Sistema antifraude
export const deviceFingerprints = pgTable('device_fingerprints', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  fingerprint: varchar('fingerprint', { length: 255 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  screenResolution: varchar('screen_resolution', { length: 50 }),
  timezone: varchar('timezone', { length: 50 }),
  language: varchar('language', { length: 10 }),
  platform: varchar('platform', { length: 50 }),
  cookiesEnabled: boolean('cookies_enabled'),
  javaEnabled: boolean('java_enabled'),
  riskScore: integer('risk_score').default(0), // 0-100
  isBlocked: boolean('is_blocked').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  lastSeen: timestamp('last_seen').defaultNow()
});

export const fraudChecks = pgTable('fraud_checks', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id),
  userId: integer('user_id').references(() => users.id),
  checkType: varchar('check_type', { length: 50 }).notNull(), // velocity, device, scoring, 3ds
  riskScore: integer('risk_score').notNull(), // 0-100
  status: varchar('status', { length: 20 }).notNull(), // passed, failed, manual_review
  details: jsonb('details'), // detalles específicos del check
  blockedReason: text('blocked_reason'),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow()
});

export const velocityTracking = pgTable('velocity_tracking', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  ipAddress: varchar('ip_address', { length: 45 }),
  action: varchar('action', { length: 50 }).notNull(), // login, order, payment
  timeWindow: varchar('time_window', { length: 20 }).notNull(), // 1h, 24h, 7d
  count: integer('count').default(1),
  threshold: integer('threshold').notNull(),
  isExceeded: boolean('is_exceeded').default(false),
  windowStart: timestamp('window_start').notNull(),
  windowEnd: timestamp('window_end').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// SEO y metadatos
export const seoMetadata = pgTable('seo_metadata', {
  id: serial('id').primaryKey(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // product, category, vendor
  entityId: integer('entity_id').notNull(),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),
  canonicalUrl: varchar('canonical_url', { length: 500 }),
  ogTitle: varchar('og_title', { length: 255 }),
  ogDescription: text('og_description'),
  ogImage: varchar('og_image', { length: 500 }),
  structuredData: jsonb('structured_data'), // schema.org markup
  slug: varchar('slug', { length: 255 }).notNull(),
  redirectFrom: text('redirect_from').array(), // URLs antiguas que redirigen aquí
  isIndexable: boolean('is_indexable').default(true),
  lastOptimized: timestamp('last_optimized').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => [
  unique().on(table.entityType, table.entityId),
  unique().on(table.slug)
]);

// PWA y notificaciones
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  endpoint: text('endpoint').notNull(),
  p256dhKey: text('p256dh_key').notNull(),
  authKey: text('auth_key').notNull(),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const notificationQueue = pgTable('notification_queue', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(), // wishlist_deal, flash_sale, restock
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  data: jsonb('data'), // datos adicionales como product_id, etc
  scheduledFor: timestamp('scheduled_for').notNull(),
  sentAt: timestamp('sent_at'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, sent, failed
  createdAt: timestamp('created_at').defaultNow()
});

// Core Web Vitals tracking
export const webVitals = pgTable('web_vitals', {
  id: serial('id').primaryKey(),
  pageUrl: varchar('page_url', { length: 500 }).notNull(),
  metric: varchar('metric', { length: 50 }).notNull(), // LCP, FID, CLS, etc
  value: decimal('value', { precision: 10, scale: 3 }).notNull(),
  rating: varchar('rating', { length: 20 }).notNull(), // good, needs-improvement, poor
  deviceType: varchar('device_type', { length: 20 }),
  connectionType: varchar('connection_type', { length: 20 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow()
});

// ÍNDICES PARA OPTIMIZACIÓN (se definirán después del inicio exitoso)

// TIPOS PARA PRIORIDAD 1
export type SearchSynonym = typeof searchSynonyms.$inferSelect;
export type InsertSearchSynonym = z.infer<typeof insertSearchSynonymSchema>;

export type ProductSearchIndex = typeof productSearchIndex.$inferSelect;
export type InsertProductSearchIndex = z.infer<typeof insertProductSearchIndexSchema>;

export type ProductMedia = typeof productMedia.$inferSelect;
export type InsertProductMedia = z.infer<typeof insertProductMediaSchema>;

export type SizeGuide = typeof sizeGuides.$inferSelect;
export type InsertSizeGuide = z.infer<typeof insertSizeGuideSchema>;

export type StripeConnectAccount = typeof stripeConnectAccounts.$inferSelect;
export type InsertStripeConnectAccount = z.infer<typeof insertStripeConnectAccountSchema>;

export type EscrowTransaction = typeof escrowTransactions.$inferSelect;
export type InsertEscrowTransaction = z.infer<typeof insertEscrowTransactionSchema>;

export type ShippingRate = typeof shippingRates.$inferSelect;
export type InsertShippingRate = z.infer<typeof insertShippingRateSchema>;

export type ShipmentTracking = typeof shipmentTracking.$inferSelect;
export type InsertShipmentTracking = z.infer<typeof insertShipmentTrackingSchema>;

export type VendorShippingSLA = typeof vendorShippingSLA.$inferSelect;
export type InsertVendorShippingSLA = z.infer<typeof insertVendorShippingSLASchema>;

export type DisputeWorkflow = typeof disputeWorkflows.$inferSelect;
export type InsertDisputeWorkflow = z.infer<typeof insertDisputeWorkflowSchema>;

export type RMARequest = typeof rmaRequests.$inferSelect;
export type InsertRMARequest = z.infer<typeof insertRMARequestSchema>;

export type ChatFilter = typeof chatFilters.$inferSelect;
export type InsertChatFilter = z.infer<typeof insertChatFilterSchema>;

export type ChatModerationLog = typeof chatModerationLog.$inferSelect;
export type InsertChatModerationLog = z.infer<typeof insertChatModerationLogSchema>;

export type ChatAuditLog = typeof chatAuditLog.$inferSelect;
export type InsertChatAuditLog = z.infer<typeof insertChatAuditLogSchema>;

export type KYCVerification = typeof kycVerifications.$inferSelect;
export type InsertKYCVerification = z.infer<typeof insertKYCVerificationSchema>;

export type AdminKPI = typeof adminKPIs.$inferSelect;
export type InsertAdminKPI = z.infer<typeof insertAdminKPISchema>;

export type VendorPayoutQueue = typeof vendorPayoutQueue.$inferSelect;
export type InsertVendorPayoutQueue = z.infer<typeof insertVendorPayoutQueueSchema>;

// TIPOS PARA PRIORIDAD 2
export type ProductRecommendation = typeof productRecommendations.$inferSelect;
export type InsertProductRecommendation = z.infer<typeof insertProductRecommendationSchema>;

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;

export type FlashDeal = typeof flashDeals.$inferSelect;
export type InsertFlashDeal = z.infer<typeof insertFlashDealSchema>;

export type PromotionUsage = typeof promotionUsage.$inferSelect;
export type InsertPromotionUsage = z.infer<typeof insertPromotionUsageSchema>;

export type ReviewHelpfulness = typeof reviewHelpfulness.$inferSelect;
export type InsertReviewHelpfulness = z.infer<typeof insertReviewHelpfulnessSchema>;

export type ReviewMedia = typeof reviewMedia.$inferSelect;
export type InsertReviewMedia = z.infer<typeof insertReviewMediaSchema>;

export type VendorReviewResponse = typeof vendorReviewResponses.$inferSelect;
export type InsertVendorReviewResponse = z.infer<typeof insertVendorReviewResponseSchema>;

export type InventoryManagement = typeof inventoryManagement.$inferSelect;
export type InsertInventoryManagement = z.infer<typeof insertInventoryManagementSchema>;

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;

export type ShippingZone = typeof shippingZones.$inferSelect;
export type InsertShippingZone = z.infer<typeof insertShippingZoneSchema>;

export type DeviceFingerprint = typeof deviceFingerprints.$inferSelect;
export type InsertDeviceFingerprint = z.infer<typeof insertDeviceFingerprintSchema>;

export type FraudCheck = typeof fraudChecks.$inferSelect;
export type InsertFraudCheck = z.infer<typeof insertFraudCheckSchema>;

export type VelocityTracking = typeof velocityTracking.$inferSelect;
export type InsertVelocityTracking = z.infer<typeof insertVelocityTrackingSchema>;

export type SeoMetadata = typeof seoMetadata.$inferSelect;
export type InsertSeoMetadata = z.infer<typeof insertSeoMetadataSchema>;

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;

export type NotificationQueue = typeof notificationQueue.$inferSelect;
export type InsertNotificationQueue = z.infer<typeof insertNotificationQueueSchema>;

export type WebVital = typeof webVitals.$inferSelect;
export type InsertWebVital = z.infer<typeof insertWebVitalSchema>;

// INSERT SCHEMAS PARA PRIORIDAD 1
export const insertSearchSynonymSchema = createInsertSchema(searchSynonyms);
export const insertProductSearchIndexSchema = createInsertSchema(productSearchIndex);
export const insertProductMediaSchema = createInsertSchema(productMedia);
export const insertSizeGuideSchema = createInsertSchema(sizeGuides);
export const insertStripeConnectAccountSchema = createInsertSchema(stripeConnectAccounts);
export const insertEscrowTransactionSchema = createInsertSchema(escrowTransactions);
export const insertShippingRateSchema = createInsertSchema(shippingRates);
export const insertShipmentTrackingSchema = createInsertSchema(shipmentTracking);
export const insertVendorShippingSLASchema = createInsertSchema(vendorShippingSLA);
export const insertDisputeWorkflowSchema = createInsertSchema(disputeWorkflows);
export const insertRMARequestSchema = createInsertSchema(rmaRequests);
export const insertChatFilterSchema = createInsertSchema(chatFilters);
export const insertChatModerationLogSchema = createInsertSchema(chatModerationLog);
export const insertChatAuditLogSchema = createInsertSchema(chatAuditLog);
export const insertKYCVerificationSchema = createInsertSchema(kycVerifications);
export const insertAdminKPISchema = createInsertSchema(adminKPIs);
export const insertVendorPayoutQueueSchema = createInsertSchema(vendorPayoutQueue);

// INSERT SCHEMAS PARA PRIORIDAD 2
export const insertProductRecommendationSchema = createInsertSchema(productRecommendations);
export const insertPromotionSchema = createInsertSchema(promotions);
export const insertFlashDealSchema = createInsertSchema(flashDeals);
export const insertPromotionUsageSchema = createInsertSchema(promotionUsage);
export const insertReviewHelpfulnessSchema = createInsertSchema(reviewHelpfulness);
export const insertReviewMediaSchema = createInsertSchema(reviewMedia);
export const insertVendorReviewResponseSchema = createInsertSchema(vendorReviewResponses);
export const insertInventoryManagementSchema = createInsertSchema(inventoryManagement);
export const insertProductVariantSchema = createInsertSchema(productVariants);
export const insertShippingZoneSchema = createInsertSchema(shippingZones);
export const insertDeviceFingerprintSchema = createInsertSchema(deviceFingerprints);
export const insertFraudCheckSchema = createInsertSchema(fraudChecks);
export const insertVelocityTrackingSchema = createInsertSchema(velocityTracking);
export const insertSeoMetadataSchema = createInsertSchema(seoMetadata);
export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions);
export const insertNotificationQueueSchema = createInsertSchema(notificationQueue);
export const insertWebVitalSchema = createInsertSchema(webVitals);

// ============ PRIORITY 3 ENTERPRISE TABLES ============

// ADVERTISING SYSTEM - Sponsored listings, bidding, budgets
export const advertisingCampaignStatus = pgEnum('campaign_status', ['active', 'paused', 'ended', 'draft']);
export const bidStrategy = pgEnum('bid_strategy', ['manual', 'auto_maximize_clicks', 'auto_target_cpa']);

export const advertisingCampaigns = pgTable("advertising_campaigns", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: advertisingCampaignStatus("status").default("draft"),
  bidStrategy: bidStrategy("bid_strategy").default("manual"),
  dailyBudgetCents: integer("daily_budget_cents").notNull(),
  totalBudgetCents: integer("total_budget_cents").notNull(),
  spentCents: integer("spent_cents").default(0),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  targetAudience: jsonb("target_audience"), // demographics, interests, etc
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const sponsoredListings = pgTable("sponsored_listings", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  productId: integer("product_id").notNull(),
  bidAmountCents: integer("bid_amount_cents").notNull(),
  qualityScore: decimal("quality_score", { precision: 3, scale: 2 }), // 0-10
  adRank: decimal("ad_rank", { precision: 10, scale: 2 }),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  spentCents: integer("spent_cents").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const adAuctions = pgTable("ad_auctions", {
  id: serial("id").primaryKey(),
  searchQuery: varchar("search_query", { length: 255 }),
  categoryId: integer("category_id"),
  userLocation: varchar("user_location", { length: 100 }),
  winnerListingId: integer("winner_listing_id"),
  secondPriceCents: integer("second_price_cents"),
  auctionTime: timestamp("auction_time").defaultNow(),
  metadata: jsonb("metadata") // bid details, participants
});

// FULFILLMENT SYSTEM - Multi-origin warehouses, routing
export const warehouseType = pgEnum('warehouse_type', ['central', 'vendor', 'dropship', 'third_party']);
export const fulfillmentStatus = pgEnum('fulfillment_status', ['pending', 'allocated', 'picked', 'packed', 'shipped']);

export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: warehouseType("type").notNull(),
  vendorId: integer("vendor_id"), // null for central warehouses
  address: jsonb("address").notNull(),
  coordinates: jsonb("coordinates"), // lat, lng
  capacity: jsonb("capacity"), // weight, volume limits
  operatingHours: jsonb("operating_hours"),
  shippingZones: jsonb("shipping_zones"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const warehouseInventory = pgTable("warehouse_inventory", {
  id: serial("id").primaryKey(),
  warehouseId: integer("warehouse_id").notNull(),
  productId: integer("product_id").notNull(),
  variantId: integer("variant_id"),
  availableStock: integer("available_stock").notNull(),
  reservedStock: integer("reserved_stock").default(0),
  reorderPoint: integer("reorder_point").default(0),
  maxStock: integer("max_stock"),
  lastRestocked: timestamp("last_restocked"),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const fulfillmentRules = pgTable("fulfillment_rules", {
  id: serial("id").primaryKey(),
  priority: integer("priority").notNull(),
  conditions: jsonb("conditions").notNull(), // location, product type, etc
  routingStrategy: varchar("routing_strategy", { length: 50 }).notNull(), // nearest, cheapest, fastest
  maxDistance: integer("max_distance"), // in km
  shippingCostModifier: decimal("shipping_cost_modifier", { precision: 5, scale: 2 }).default('1.0'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const fulfillmentOrders = pgTable("fulfillment_orders", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  warehouseId: integer("warehouse_id").notNull(),
  status: fulfillmentStatus("status").default("pending"),
  packageDimensions: jsonb("package_dimensions"), // weight, volume
  estimatedShippingCost: integer("estimated_shipping_cost_cents"),
  actualShippingCost: integer("actual_shipping_cost_cents"),
  pickingInstructions: text("picking_instructions"),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  pickedAt: timestamp("picked_at"),
  packedAt: timestamp("packed_at"),
  shippedAt: timestamp("shipped_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// OBSERVABILITY SYSTEM - Logs, metrics, tracing, SLOs
export const logLevel = pgEnum('log_level', ['debug', 'info', 'warn', 'error', 'critical']);
export const metricType = pgEnum('metric_type', ['counter', 'gauge', 'histogram', 'summary']);

export const structuredLogs = pgTable("structured_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  level: logLevel("level").notNull(),
  service: varchar("service", { length: 100 }).notNull(),
  traceId: varchar("trace_id", { length: 64 }),
  spanId: varchar("span_id", { length: 16 }),
  userId: integer("user_id"),
  action: varchar("action", { length: 100 }),
  resource: varchar("resource", { length: 255 }),
  message: text("message").notNull(),
  context: jsonb("context"), // additional structured data
  duration: integer("duration_ms"),
  statusCode: integer("status_code"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow()
});

export const prometheusMetrics = pgTable("prometheus_metrics", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: metricType("type").notNull(),
  value: decimal("value", { precision: 20, scale: 6 }).notNull(),
  labels: jsonb("labels"), // key-value pairs
  help: text("help"),
  unit: varchar("unit", { length: 50 }),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const distributedTraces = pgTable("distributed_traces", {
  id: serial("id").primaryKey(),
  traceId: varchar("trace_id", { length: 64 }).notNull(),
  spanId: varchar("span_id", { length: 16 }).notNull(),
  parentSpanId: varchar("parent_span_id", { length: 16 }),
  operationName: varchar("operation_name", { length: 255 }).notNull(),
  service: varchar("service", { length: 100 }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration_ms"),
  tags: jsonb("tags"),
  logs: jsonb("logs"),
  status: varchar("status", { length: 20 }),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow()
});

export const sloDefinitions = pgTable("slo_definitions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  targetPercentage: decimal("target_percentage", { precision: 5, scale: 2 }).notNull(), // 99.9%
  measurementWindow: varchar("measurement_window", { length: 50 }).notNull(), // "30d", "7d"
  query: text("query").notNull(), // Prometheus query
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const sloMeasurements = pgTable("slo_measurements", {
  id: serial("id").primaryKey(),
  sloDefinitionId: integer("slo_definition_id").notNull(),
  actualPercentage: decimal("actual_percentage", { precision: 5, scale: 2 }).notNull(),
  errorBudgetConsumed: decimal("error_budget_consumed", { precision: 5, scale: 2 }),
  measurementPeriod: timestamp("measurement_period").notNull(),
  isBreached: boolean("is_breached").default(false),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow()
});

// DATA ANALYTICS SYSTEM - ETL, cohorts, LTV, A/B testing
export const dataSourceType = pgEnum('data_source_type', ['database', 'api', 'file', 'stream']);
export const etlStatus = pgEnum('etl_status', ['pending', 'running', 'completed', 'failed']);
export const experimentStatus = pgEnum('experiment_status', ['draft', 'running', 'completed', 'paused']);

export const dataWarehouseJobs = pgTable("data_warehouse_jobs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sourceType: dataSourceType("source_type").notNull(),
  sourceConfig: jsonb("source_config").notNull(),
  destinationTable: varchar("destination_table", { length: 255 }).notNull(),
  transformQuery: text("transform_query"),
  schedule: varchar("schedule", { length: 100 }), // cron expression
  status: etlStatus("status").default("pending"),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  errorMessage: text("error_message"),
  processedRows: integer("processed_rows"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const userCohorts = pgTable("user_cohorts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  criteria: jsonb("criteria").notNull(), // segmentation rules
  userCount: integer("user_count").default(0),
  acquisitionCostAvg: integer("acquisition_cost_avg_cents"),
  revenueGenerated: integer("revenue_generated_cents").default(0),
  retentionRate30d: decimal("retention_rate_30d", { precision: 5, scale: 2 }),
  retentionRate90d: decimal("retention_rate_90d", { precision: 5, scale: 2 }),
  ltvEstimate: integer("ltv_estimate_cents"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const ltvCalculations = pgTable("ltv_calculations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cohortId: integer("cohort_id"),
  acquisitionDate: timestamp("acquisition_date").notNull(),
  totalRevenueGenerated: integer("total_revenue_generated_cents").default(0),
  totalOrdersPlaced: integer("total_orders_placed").default(0),
  averageOrderValue: integer("average_order_value_cents"),
  daysSinceAcquisition: integer("days_since_acquisition"),
  predictedLtv: integer("predicted_ltv_cents"),
  actualLtv: integer("actual_ltv_cents"),
  churnProbability: decimal("churn_probability", { precision: 5, scale: 4 }),
  lastActivityDate: timestamp("last_activity_date"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const abTestExperiments = pgTable("ab_test_experiments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  featureFlag: varchar("feature_flag", { length: 100 }).notNull(),
  status: experimentStatus("status").default("draft"),
  hypothesis: text("hypothesis"),
  variants: jsonb("variants").notNull(), // control + test variants
  trafficAllocation: jsonb("traffic_allocation").notNull(), // % split
  targetAudience: jsonb("target_audience"),
  primaryMetric: varchar("primary_metric", { length: 100 }).notNull(),
  secondaryMetrics: jsonb("secondary_metrics"),
  minSampleSize: integer("min_sample_size"),
  confidenceLevel: decimal("confidence_level", { precision: 3, scale: 2 }).default('0.95'),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  results: jsonb("results"),
  winnerId: varchar("winner_id", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(false),
  rolloutPercentage: decimal("rollout_percentage", { precision: 5, scale: 2 }).default('0'),
  targetAudience: jsonb("target_audience"), // user segments
  variations: jsonb("variations"), // different feature variations
  environmentRestrictions: jsonb("environment_restrictions"),
  createdBy: integer("created_by").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// LOCALIZATION SYSTEM - Multi-language, multi-currency
export const supportedLanguage = pgEnum('supported_language', ['es', 'en']);
export const supportedCurrency = pgEnum('supported_currency', ['MXN', 'USD']);

export const localizationTranslations = pgTable("localization_translations", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'product', 'category', 'ui'
  entityId: integer("entity_id"), // null for UI translations
  fieldName: varchar("field_name", { length: 100 }).notNull(),
  language: supportedLanguage("language").notNull(),
  originalText: text("original_text").notNull(),
  translatedText: text("translated_text").notNull(),
  isAutomated: boolean("is_automated").default(false),
  qualityScore: decimal("quality_score", { precision: 3, scale: 2 }),
  translatedBy: integer("translated_by"), // user ID
  approvedBy: integer("approved_by"), // user ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const currencyExchangeRates = pgTable("currency_exchange_rates", {
  id: serial("id").primaryKey(),
  fromCurrency: supportedCurrency("from_currency").notNull(),
  toCurrency: supportedCurrency("to_currency").notNull(),
  rate: decimal("rate", { precision: 10, scale: 6 }).notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  source: varchar("source", { length: 100 }), // API provider
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const multiCurrencyPricing = pgTable("multi_currency_pricing", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  currency: supportedCurrency("currency").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  isAutoConverted: boolean("is_auto_converted").default(false),
  conversionRate: decimal("conversion_rate", { precision: 10, scale: 6 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

export const taxRules = pgTable("tax_rules", {
  id: serial("id").primaryKey(),
  country: varchar("country", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }),
  productCategory: varchar("product_category", { length: 100 }),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).notNull(), // 0.16 for 16%
  taxType: varchar("tax_type", { length: 50 }).notNull(), // 'VAT', 'IVA', 'Sales Tax'
  isInclusive: boolean("is_inclusive").default(true), // tax included in price
  roundingRule: varchar("rounding_rule", { length: 20 }).default('round_half_up'),
  effectiveDate: timestamp("effective_date").notNull(),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

export const cfdiInvoices = pgTable("cfdi_invoices", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  userId: integer("user_id").notNull(),
  fiscalData: jsonb("fiscal_data").notNull(), // RFC, business name, address
  uuid: varchar("uuid", { length: 36 }).notNull().unique(),
  xmlContent: text("xml_content"),
  pdfUrl: varchar("pdf_url", { length: 500 }),
  status: varchar("status", { length: 20 }).default("pending"), // pending, issued, cancelled
  satResponse: jsonb("sat_response"),
  totalAmount: integer("total_amount_cents").notNull(),
  taxes: jsonb("taxes").notNull(),
  issuedAt: timestamp("issued_at"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// ============ PRIORITY 3 TYPE EXPORTS ============

export type AdvertisingCampaign = typeof advertisingCampaigns.$inferSelect;
export type InsertAdvertisingCampaign = z.infer<typeof insertAdvertisingCampaignSchema>;

export type SponsoredListing = typeof sponsoredListings.$inferSelect;
export type InsertSponsoredListing = z.infer<typeof insertSponsoredListingSchema>;

export type AdAuction = typeof adAuctions.$inferSelect;
export type InsertAdAuction = z.infer<typeof insertAdAuctionSchema>;

export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;

export type WarehouseInventory = typeof warehouseInventory.$inferSelect;
export type InsertWarehouseInventory = z.infer<typeof insertWarehouseInventorySchema>;

export type FulfillmentRule = typeof fulfillmentRules.$inferSelect;
export type InsertFulfillmentRule = z.infer<typeof insertFulfillmentRuleSchema>;

export type FulfillmentOrder = typeof fulfillmentOrders.$inferSelect;
export type InsertFulfillmentOrder = z.infer<typeof insertFulfillmentOrderSchema>;

export type StructuredLog = typeof structuredLogs.$inferSelect;
export type InsertStructuredLog = z.infer<typeof insertStructuredLogSchema>;

export type PrometheusMetric = typeof prometheusMetrics.$inferSelect;
export type InsertPrometheusMetric = z.infer<typeof insertPrometheusMetricSchema>;

export type DistributedTrace = typeof distributedTraces.$inferSelect;
export type InsertDistributedTrace = z.infer<typeof insertDistributedTraceSchema>;

export type SLODefinition = typeof sloDefinitions.$inferSelect;
export type InsertSLODefinition = z.infer<typeof insertSLODefinitionSchema>;

export type SLOMeasurement = typeof sloMeasurements.$inferSelect;
export type InsertSLOMeasurement = z.infer<typeof insertSLOMeasurementSchema>;

export type DataWarehouseJob = typeof dataWarehouseJobs.$inferSelect;
export type InsertDataWarehouseJob = z.infer<typeof insertDataWarehouseJobSchema>;

export type UserCohort = typeof userCohorts.$inferSelect;
export type InsertUserCohort = z.infer<typeof insertUserCohortSchema>;

export type LTVCalculation = typeof ltvCalculations.$inferSelect;
export type InsertLTVCalculation = z.infer<typeof insertLTVCalculationSchema>;

export type ABTestExperiment = typeof abTestExperiments.$inferSelect;
export type InsertABTestExperiment = z.infer<typeof insertABTestExperimentSchema>;

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;

export type LocalizationTranslation = typeof localizationTranslations.$inferSelect;
export type InsertLocalizationTranslation = z.infer<typeof insertLocalizationTranslationSchema>;

export type CurrencyExchangeRate = typeof currencyExchangeRates.$inferSelect;
export type InsertCurrencyExchangeRate = z.infer<typeof insertCurrencyExchangeRateSchema>;

export type MultiCurrencyPricing = typeof multiCurrencyPricing.$inferSelect;
export type InsertMultiCurrencyPricing = z.infer<typeof insertMultiCurrencyPricingSchema>;

export type TaxRule = typeof taxRules.$inferSelect;
export type InsertTaxRule = z.infer<typeof insertTaxRuleSchema>;

export type CFDIInvoice = typeof cfdiInvoices.$inferSelect;
export type InsertCFDIInvoice = z.infer<typeof insertCFDIInvoiceSchema>;

// INSERT SCHEMAS PARA PRIORIDAD 3
export const insertAdvertisingCampaignSchema = createInsertSchema(advertisingCampaigns);
export const insertSponsoredListingSchema = createInsertSchema(sponsoredListings);
export const insertAdAuctionSchema = createInsertSchema(adAuctions);
export const insertWarehouseSchema = createInsertSchema(warehouses);
export const insertWarehouseInventorySchema = createInsertSchema(warehouseInventory);
export const insertFulfillmentRuleSchema = createInsertSchema(fulfillmentRules);
export const insertFulfillmentOrderSchema = createInsertSchema(fulfillmentOrders);
export const insertStructuredLogSchema = createInsertSchema(structuredLogs);
export const insertPrometheusMetricSchema = createInsertSchema(prometheusMetrics);
export const insertDistributedTraceSchema = createInsertSchema(distributedTraces);
export const insertSLODefinitionSchema = createInsertSchema(sloDefinitions);
export const insertSLOMeasurementSchema = createInsertSchema(sloMeasurements);
export const insertDataWarehouseJobSchema = createInsertSchema(dataWarehouseJobs);
export const insertUserCohortSchema = createInsertSchema(userCohorts);
export const insertLTVCalculationSchema = createInsertSchema(ltvCalculations);
export const insertABTestExperimentSchema = createInsertSchema(abTestExperiments);
export const insertFeatureFlagSchema = createInsertSchema(featureFlags);
export const insertLocalizationTranslationSchema = createInsertSchema(localizationTranslations);
export const insertCurrencyExchangeRateSchema = createInsertSchema(currencyExchangeRates);
export const insertMultiCurrencyPricingSchema = createInsertSchema(multiCurrencyPricing);
export const insertTaxRuleSchema = createInsertSchema(taxRules);
export const insertCFDIInvoiceSchema = createInsertSchema(cfdiInvoices);
