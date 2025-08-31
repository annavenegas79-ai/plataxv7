var __defProp = Object.defineProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.prod.ts
import express2 from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  addresses: () => addresses,
  addressesRelations: () => addressesRelations,
  auditLogs: () => auditLogs,
  auditLogsRelations: () => auditLogsRelations,
  cart: () => cart,
  cartRelations: () => cartRelations,
  categories: () => categories,
  categoriesRelations: () => categoriesRelations,
  chatRooms: () => chatRooms,
  chatRoomsRelations: () => chatRoomsRelations,
  disputeReason: () => disputeReason,
  disputeStatus: () => disputeStatus,
  disputes: () => disputes,
  disputesRelations: () => disputesRelations,
  insertAddressSchema: () => insertAddressSchema,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertCartSchema: () => insertCartSchema,
  insertChatRoomSchema: () => insertChatRoomSchema,
  insertDisputeSchema: () => insertDisputeSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPayoutSchema: () => insertPayoutSchema,
  insertProductSchema: () => insertProductSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertSellerProfileSchema: () => insertSellerProfileSchema,
  insertShipmentSchema: () => insertShipmentSchema,
  insertUserSchema: () => insertUserSchema,
  insertWalletSchema: () => insertWalletSchema,
  kycStatus: () => kycStatus,
  material: () => material,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orderStatus: () => orderStatus,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  payoutStatus: () => payoutStatus,
  payouts: () => payouts,
  payoutsRelations: () => payoutsRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  reviews: () => reviews,
  reviewsRelations: () => reviewsRelations,
  sellerProfiles: () => sellerProfiles,
  sellerProfilesRelations: () => sellerProfilesRelations,
  shipmentStatus: () => shipmentStatus,
  shipments: () => shipments,
  shipmentsRelations: () => shipmentsRelations,
  userRole: () => userRole,
  users: () => users,
  usersRelations: () => usersRelations,
  wallets: () => wallets,
  walletsRelations: () => walletsRelations,
  wishlist: () => wishlist,
  wishlistRelations: () => wishlistRelations
});
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb, serial, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var userRole = pgEnum("user_role", ["cliente", "vendedor", "admin"]);
var kycStatus = pgEnum("kyc_status", ["pending", "approved", "rejected"]);
var material = pgEnum("material", ["silver_925", "silver_950"]);
var orderStatus = pgEnum("order_status", ["created", "paid", "shipped", "delivered", "cancelled"]);
var payoutStatus = pgEnum("payout_status", ["pending", "paid", "failed"]);
var shipmentStatus = pgEnum("shipment_status", ["label_created", "in_transit", "delivered"]);
var disputeReason = pgEnum("dispute_reason", ["not_received", "damaged", "not_as_described"]);
var disputeStatus = pgEnum("dispute_status", ["open", "under_review", "resolved_buyer", "resolved_seller", "refunded"]);
var users = pgTable("users", {
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
var sellerProfiles = pgTable("seller_profiles", {
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
var addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  line1: varchar("line1", { length: 255 }).notNull(),
  line2: varchar("line2", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  zip: varchar("zip", { length: 20 }).notNull(),
  country: varchar("country", { length: 100 }).notNull().default("M\xE9xico"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  balanceCents: integer("balance_cents").notNull().default(0),
  currency: varchar("currency", { length: 3 }).notNull().default("MXN"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  amountCents: integer("amount_cents").notNull(),
  status: payoutStatus("status").default("pending"),
  reference: varchar("reference", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  image: text("image"),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  material: material("material").notNull().default("silver_925"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  categoryId: integer("category_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  images: jsonb("images").notNull(),
  // array of image URLs
  specifications: jsonb("specifications"),
  // material, weight, dimensions, etc.
  stock: integer("stock").notNull().default(0),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orders = pgTable("orders", {
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
var shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().unique(),
  carrier: varchar("carrier", { length: 100 }).notNull(),
  tracking: varchar("tracking", { length: 100 }),
  status: shipmentStatus("status").default("label_created"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  openedById: integer("opened_by_id").notNull(),
  reason: disputeReason("reason").notNull(),
  status: disputeStatus("status").default("open"),
  notes: jsonb("notes"),
  // array of notes with timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().unique(),
  buyerId: integer("buyer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  locked: boolean("locked").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  redactions: jsonb("redactions"),
  // array of redacted patterns
  systemFlags: jsonb("system_flags"),
  // flags for censored content, etc.
  createdAt: timestamp("created_at").defaultNow()
});
var auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorId: integer("actor_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 100 }).notNull(),
  entityId: integer("entity_id"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").defaultNow()
});
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  priceCents: integer("price_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderItemId: integer("order_item_id").notNull(),
  rating: integer("rating").notNull(),
  // 1-5
  comment: text("comment"),
  createdBy: integer("created_by").notNull(),
  images: jsonb("images"),
  // array of review image URLs
  createdAt: timestamp("created_at").defaultNow()
});
var wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var cart = pgTable("cart", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var usersRelations = relations(users, ({ one, many }) => ({
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
  auditLogs: many(auditLogs)
}));
var sellerProfilesRelations = relations(sellerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [sellerProfiles.userId],
    references: [users.id]
  })
}));
var addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id]
  })
}));
var walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id]
  })
}));
var payoutsRelations = relations(payouts, ({ one }) => ({
  seller: one(users, {
    fields: [payouts.sellerId],
    references: [users.id]
  })
}));
var categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id]
  }),
  children: many(categories),
  products: many(products)
}));
var productsRelations = relations(products, ({ one, many }) => ({
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
  cart: many(cart)
}));
var ordersRelations = relations(orders, ({ one, many }) => ({
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
var orderItemsRelations = relations(orderItems, ({ one, many }) => ({
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
var shipmentsRelations = relations(shipments, ({ one }) => ({
  order: one(orders, {
    fields: [shipments.orderId],
    references: [orders.id]
  })
}));
var disputesRelations = relations(disputes, ({ one }) => ({
  order: one(orders, {
    fields: [disputes.orderId],
    references: [orders.id]
  }),
  openedBy: one(users, {
    fields: [disputes.openedById],
    references: [users.id]
  })
}));
var chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
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
var messagesRelations = relations(messages, ({ one }) => ({
  room: one(chatRooms, {
    fields: [messages.roomId],
    references: [chatRooms.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  })
}));
var reviewsRelations = relations(reviews, ({ one }) => ({
  orderItem: one(orderItems, {
    fields: [reviews.orderItemId],
    references: [orderItems.id]
  }),
  createdBy: one(users, {
    fields: [reviews.createdBy],
    references: [users.id]
  })
}));
var wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, {
    fields: [wishlist.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [wishlist.productId],
    references: [products.id]
  })
}));
var cartRelations = relations(cart, ({ one }) => ({
  user: one(users, {
    fields: [cart.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [cart.productId],
    references: [products.id]
  })
}));
var auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  refreshToken: true,
  refreshTokenExpiresAt: true,
  createdAt: true,
  updatedAt: true
});
var insertSellerProfileSchema = createInsertSchema(sellerProfiles).omit({
  id: true,
  silverCheck: true,
  createdAt: true,
  updatedAt: true
});
var insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true
});
var insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertDisputeSchema = createInsertSchema(disputes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});
var insertCartSchema = createInsertSchema(cart).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, desc, asc, ilike, gte, lte } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async setRefreshToken(userId, refreshToken, expiresAt) {
    await db.update(users).set({
      refreshToken,
      refreshTokenExpiresAt: expiresAt
    }).where(eq(users.id, userId));
  }
  async validateRefreshToken(userId, refreshToken) {
    const [user] = await db.select({
      refreshToken: users.refreshToken,
      refreshTokenExpiresAt: users.refreshTokenExpiresAt
    }).from(users).where(eq(users.id, userId));
    if (!user || !user.refreshToken || !user.refreshTokenExpiresAt) {
      return false;
    }
    const isValid = user.refreshToken === refreshToken && /* @__PURE__ */ new Date() < user.refreshTokenExpiresAt;
    return isValid;
  }
  async clearRefreshToken(userId) {
    await db.update(users).set({
      refreshToken: null,
      refreshTokenExpiresAt: null
    }).where(eq(users.id, userId));
  }
  async getProducts(filters) {
    const conditions = [eq(products.isActive, true)];
    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    if (filters?.sellerId) {
      conditions.push(eq(products.sellerId, filters.sellerId));
    }
    if (filters?.search) {
      conditions.push(ilike(products.title, `%${filters.search}%`));
    }
    if (filters?.minPrice) {
      conditions.push(gte(products.price, filters.minPrice.toString()));
    }
    if (filters?.maxPrice) {
      conditions.push(lte(products.price, filters.maxPrice.toString()));
    }
    let query = db.select().from(products).where(and(...conditions));
    if (filters?.sortBy === "price") {
      query = query.orderBy(filters.sortOrder === "desc" ? desc(products.price) : asc(products.price));
    } else if (filters?.sortBy === "rating") {
      query = query.orderBy(filters.sortOrder === "desc" ? desc(products.rating) : asc(products.rating));
    } else {
      query = query.orderBy(desc(products.createdAt));
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    return await query;
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || void 0;
  }
  async createProduct(product) {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  async updateProduct(id, updates) {
    const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return product || void 0;
  }
  async deleteProduct(id) {
    const result = await db.update(products).set({ isActive: false }).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async getCategories() {
    return db.select().from(categories).orderBy(asc(categories.name));
  }
  async getCategory(id) {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || void 0;
  }
  async getUserCart(userId) {
    return db.select({
      id: cart.id,
      userId: cart.userId,
      productId: cart.productId,
      quantity: cart.quantity,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      product: products
    }).from(cart).innerJoin(products, eq(cart.productId, products.id)).where(eq(cart.userId, userId));
  }
  async addToCart(cartItem) {
    const [existing] = await db.select().from(cart).where(and(eq(cart.userId, cartItem.userId), eq(cart.productId, cartItem.productId)));
    if (existing) {
      const [updated] = await db.update(cart).set({ quantity: existing.quantity + (cartItem.quantity || 1) }).where(eq(cart.id, existing.id)).returning();
      return updated;
    } else {
      const [newItem] = await db.insert(cart).values(cartItem).returning();
      return newItem;
    }
  }
  async updateCartItem(userId, productId, quantity) {
    const [updated] = await db.update(cart).set({ quantity }).where(and(eq(cart.userId, userId), eq(cart.productId, productId))).returning();
    return updated || void 0;
  }
  async removeFromCart(userId, productId) {
    const result = await db.delete(cart).where(and(eq(cart.userId, userId), eq(cart.productId, productId)));
    return (result.rowCount ?? 0) > 0;
  }
  async clearCart(userId) {
    const result = await db.delete(cart).where(eq(cart.userId, userId));
    return (result.rowCount ?? 0) > 0;
  }
  async getUserWishlist(userId) {
    return db.select({
      id: wishlist.id,
      userId: wishlist.userId,
      productId: wishlist.productId,
      createdAt: wishlist.createdAt,
      product: products
    }).from(wishlist).innerJoin(products, eq(wishlist.productId, products.id)).where(eq(wishlist.userId, userId));
  }
  async addToWishlist(userId, productId) {
    const [item] = await db.insert(wishlist).values({ userId, productId }).returning();
    return item;
  }
  async removeFromWishlist(userId, productId) {
    const result = await db.delete(wishlist).where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
    return (result.rowCount ?? 0) > 0;
  }
  async getUserOrders(userId) {
    const userOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db.select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          createdAt: orderItems.createdAt,
          product: products
        }).from(orderItems).innerJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );
    return ordersWithItems;
  }
  async getOrder(id) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return void 0;
    const items = await db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      createdAt: orderItems.createdAt,
      product: products
    }).from(orderItems).innerJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, order.id));
    return { ...order, items };
  }
  async createOrder(order, items) {
    const [newOrder] = await db.insert(orders).values(order).returning();
    const orderItemsWithOrderId = items.map((item) => ({
      ...item,
      orderId: newOrder.id
    }));
    await db.insert(orderItems).values(orderItemsWithOrderId);
    return newOrder;
  }
  async updateOrderStatus(id, status) {
    const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return order || void 0;
  }
  async getProductReviews(productId) {
    return db.select({
      id: reviews.id,
      productId: reviews.productId,
      userId: reviews.userId,
      orderId: reviews.orderId,
      rating: reviews.rating,
      comment: reviews.comment,
      images: reviews.images,
      createdAt: reviews.createdAt,
      user: users
    }).from(reviews).innerJoin(users, eq(reviews.userId, users.id)).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
  }
  async createReview(review) {
    const [newReview] = await db.insert(reviews).values(review).returning();
    const productReviews = await db.select().from(reviews).where(eq(reviews.productId, review.productId));
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    await db.update(products).set({
      rating: avgRating.toFixed(1),
      reviewCount: productReviews.length
    }).where(eq(products.id, review.productId));
    return newReview;
  }
  async getUserReviews(userId) {
    return db.select({
      id: reviews.id,
      productId: reviews.productId,
      userId: reviews.userId,
      orderId: reviews.orderId,
      rating: reviews.rating,
      comment: reviews.comment,
      images: reviews.images,
      createdAt: reviews.createdAt,
      product: products
    }).from(reviews).innerJoin(products, eq(reviews.productId, products.id)).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
  }
  // Seller profile methods
  async getSellerProfile(userId) {
    const [profile] = await db.select().from(sellerProfiles).where(eq(sellerProfiles.userId, userId));
    return profile || void 0;
  }
  async createSellerProfile(profile) {
    const [newProfile] = await db.insert(sellerProfiles).values(profile).returning();
    return newProfile;
  }
  async updateSellerProfile(userId, updates) {
    const [profile] = await db.update(sellerProfiles).set(updates).where(eq(sellerProfiles.userId, userId)).returning();
    return profile || void 0;
  }
  async getAllUsers() {
    return db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      password: users.password,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      isVerified: users.isVerified,
      verificationDocuments: users.verificationDocuments,
      avatar: users.avatar,
      refreshToken: users.refreshToken,
      refreshTokenExpiresAt: users.refreshTokenExpiresAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      sellerProfile: sellerProfiles
    }).from(users).leftJoin(sellerProfiles, eq(users.id, sellerProfiles.userId)).orderBy(desc(users.createdAt));
  }
  // KYC methods
  async getPendingKycRequests() {
    return db.select({
      id: sellerProfiles.id,
      userId: sellerProfiles.userId,
      storeName: sellerProfiles.storeName,
      bio: sellerProfiles.bio,
      silverCheck: sellerProfiles.silverCheck,
      kycStatus: sellerProfiles.kycStatus,
      kycDocs: sellerProfiles.kycDocs,
      createdAt: sellerProfiles.createdAt,
      updatedAt: sellerProfiles.updatedAt,
      user: users
    }).from(sellerProfiles).innerJoin(users, eq(sellerProfiles.userId, users.id)).where(eq(sellerProfiles.kycStatus, "pending")).orderBy(desc(sellerProfiles.createdAt));
  }
  async getKycRequest(userId) {
    const [result] = await db.select({
      id: sellerProfiles.id,
      userId: sellerProfiles.userId,
      storeName: sellerProfiles.storeName,
      bio: sellerProfiles.bio,
      silverCheck: sellerProfiles.silverCheck,
      kycStatus: sellerProfiles.kycStatus,
      kycDocs: sellerProfiles.kycDocs,
      createdAt: sellerProfiles.createdAt,
      updatedAt: sellerProfiles.updatedAt,
      user: users
    }).from(sellerProfiles).innerJoin(users, eq(sellerProfiles.userId, users.id)).where(eq(sellerProfiles.userId, userId));
    return result || void 0;
  }
  async updateKycStatus(userId, status) {
    const [profile] = await db.update(sellerProfiles).set({ kycStatus: status }).where(eq(sellerProfiles.userId, userId)).returning();
    return profile || void 0;
  }
  async getKycStats() {
    const pendingCount = await db.select().from(sellerProfiles).where(eq(sellerProfiles.kycStatus, "pending"));
    const approvedCount = await db.select().from(sellerProfiles).where(eq(sellerProfiles.kycStatus, "approved"));
    const rejectedCount = await db.select().from(sellerProfiles).where(eq(sellerProfiles.kycStatus, "rejected"));
    return {
      pending: pendingCount.length,
      approved: approvedCount.length,
      rejected: rejectedCount.length
    };
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
var REFRESH_SECRET = process.env.REFRESH_SECRET || "your-refresh-secret-key";
var generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "15m" });
};
var generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};
var setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1e3
    // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1e3
    // 7 days
  });
};
var authenticateToken = async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ message: "No access token provided" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Access token expired" });
    }
    return res.status(403).json({ message: "Invalid access token" });
  }
};
var requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador." });
  }
  next();
};
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken();
      const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      await storage.setRefreshToken(user.id, refreshToken, refreshExpires);
      setTokenCookies(res, accessToken, refreshToken);
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified,
          avatar: user.avatar
        }
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inv\xE1lidas" });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Credenciales inv\xE1lidas" });
      }
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken();
      const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      await storage.setRefreshToken(user.id, refreshToken, refreshExpires);
      setTokenCookies(res, accessToken, refreshToken);
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified,
          avatar: user.avatar
        }
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/auth/refresh", async (req, res) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
      }
      let userId;
      try {
        const decoded = jwt.decode(req.cookies?.accessToken);
        userId = decoded?.id;
      } catch {
        return res.status(401).json({ message: "Invalid token format" });
      }
      const isValidRefresh = await storage.validateRefreshToken(userId, refreshToken);
      if (!isValidRefresh) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
      const newAccessToken = generateAccessToken(userId);
      const newRefreshToken = generateRefreshToken();
      const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      await storage.setRefreshToken(userId, newRefreshToken, refreshExpires);
      setTokenCookies(res, newAccessToken, newRefreshToken);
      res.json({ success: true, message: "Tokens refreshed" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/auth/logout", async (req, res) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        try {
          const decoded = jwt.decode(req.cookies?.accessToken);
          if (decoded?.id) {
            await storage.clearRefreshToken(decoded.id);
          }
        } catch {
        }
      }
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/auth/me", authenticateToken, (req, res) => {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        isVerified: req.user.isVerified,
        avatar: req.user.avatar
      }
    });
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const filters = {
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : void 0,
        sellerId: req.query.sellerId ? parseInt(req.query.sellerId) : void 0,
        search: req.query.search,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : void 0,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : void 0,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };
      const products2 = await storage.getProducts(filters);
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/products", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== "vendedor" && req.user.role !== "admin") {
        return res.status(403).json({ message: "Only sellers can create products" });
      }
      const productData = insertProductSchema.parse({
        ...req.body,
        sellerId: req.user.id
      });
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/cart", authenticateToken, async (req, res) => {
    try {
      const cart2 = await storage.getUserCart(req.user.id);
      res.json(cart2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/cart", authenticateToken, async (req, res) => {
    try {
      const cartData = insertCartSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const cartItem = await storage.addToCart(cartData);
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.put("/api/cart/:productId", authenticateToken, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.user.id, productId, quantity);
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.delete("/api/cart/:productId", authenticateToken, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const success = await storage.removeFromCart(req.user.id, productId);
      if (!success) {
        return res.status(404).json({ message: "Item not found in cart" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/wishlist", authenticateToken, async (req, res) => {
    try {
      const wishlist2 = await storage.getUserWishlist(req.user.id);
      res.json(wishlist2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/wishlist", authenticateToken, async (req, res) => {
    try {
      const { productId } = req.body;
      const wishlistItem = await storage.addToWishlist(req.user.id, productId);
      res.json(wishlistItem);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.delete("/api/wishlist/:productId", authenticateToken, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const success = await storage.removeFromWishlist(req.user.id, productId);
      if (!success) {
        return res.status(404).json({ message: "Item not found in wishlist" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/orders", authenticateToken, async (req, res) => {
    try {
      const orders2 = await storage.getUserOrders(req.user.id);
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/orders", authenticateToken, async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const { items } = req.body;
      const order = await storage.createOrder(orderData, items);
      await storage.clearCart(req.user.id);
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews2 = await storage.getProductReviews(productId);
      res.json(reviews2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/reviews", authenticateToken, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.put("/api/admin/users/:id/verify", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { isVerified } = req.body;
      const user = await storage.updateUser(userId, { isVerified });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const success = await storage.updateUser(userId, { isVerified: false });
      if (!success) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json({ success: true, message: "Usuario desactivado" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/admin/kyc/stats", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getKycStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/kyc/pending", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getPendingKycRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/kyc/:userId", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const request = await storage.getKycRequest(userId);
      if (!request) {
        return res.status(404).json({ message: "Solicitud KYC no encontrada" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.put("/api/admin/kyc/:userId/status", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { status } = req.body;
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Estado KYC inv\xE1lido" });
      }
      const profile = await storage.updateKycStatus(userId, status);
      if (!profile) {
        return res.status(404).json({ message: "Perfil de vendedor no encontrado" });
      }
      if (status === "approved") {
        await storage.updateUser(userId, { isVerified: true });
      }
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/seller/profile", authenticateToken, async (req, res) => {
    try {
      const profile = await storage.getSellerProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/seller/profile", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== "vendedor") {
        return res.status(403).json({ message: "Solo los vendedores pueden crear perfiles de tienda" });
      }
      const profileData = insertSellerProfileSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const existingProfile = await storage.getSellerProfile(req.user.id);
      if (existingProfile) {
        return res.status(400).json({ message: "Ya tienes un perfil de vendedor" });
      }
      const profile = await storage.createSellerProfile(profileData);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.put("/api/seller/profile", authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== "vendedor") {
        return res.status(403).json({ message: "Solo los vendedores pueden actualizar perfiles de tienda" });
      }
      const updates = req.body;
      const profile = await storage.updateSellerProfile(req.user.id, updates);
      if (!profile) {
        return res.status(404).json({ message: "Perfil de vendedor no encontrado" });
      }
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.prod.ts
import express from "express";
import fs from "fs";
import path from "path";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  serveStatic(app2);
}
function serveStatic(app2) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
  app2.use(express.static(distPath, {
    maxAge: "1y",
    etag: true
  }));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// server/index.prod.ts
var app = express2();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5000"],
  credentials: true
}));
if (process.env.NODE_ENV === "production") {
  const rateLimit = __require("express-rate-limit");
  app.use("/api/", rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 100,
    // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
  }));
}
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use(cookieParser());
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    if (process.env.NODE_ENV === "production") {
      console.error("Error:", err);
    }
    res.status(status).json({ message });
  });
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
