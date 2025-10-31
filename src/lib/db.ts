import mongoose, { Schema, Document } from "mongoose";

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || process.env.MONGODB_URI;

// Types
interface UserDocument extends Document {
  email: string;
  password_hash: string;
  name: string;
  phone: string;
  role: "industry" | "buyer";
  created_at: Date;
}

interface ProductDocument extends Document {
  name: string;
  category?: string;
  price: number;
  company?: string;
  location?: string;
  image?: string;
  images?: string[];
  rating?: number;
  description?: string;
  seller_id?: string;
  created_at: Date;
}

interface OrderDocument extends Document {
  product_name: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  total: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  created_at: Date;
}

interface SocialPostDocument extends Document {
  user_id: string;
  username: string;
  avatar: string;
  type: "text" | "image";
  content?: string;
  media_url?: string;
  likes: number;
  comments: number;
  created_at: Date;
}

interface ClanDocument extends Document {
  name: string;
  description: string;
  creator_id: string;
  creator_name: string;
  target_product_id: string;
  target_product_name: string;
  target_price: number;
  current_funded: number;
  deadline: Date;
  status: "active" | "completed" | "failed";
  members: Array<{
    id: string;
    user_id: string;
    username: string;
    avatar: string;
    contributed_amount: number;
    joined_date: Date;
  }>;
  created_at: Date;
}

// Schemas
const userSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ["industry", "buyer"], required: true },
  created_at: { type: Date, default: Date.now },
});

const productSchema = new Schema<ProductDocument>({
  name: { type: String, required: true },
  category: String,
  price: { type: Number, required: true },
  company: String,
  location: String,
  image: String,
  images: [String],
  rating: Number,
  description: String,
  seller_id: String,
  created_at: { type: Date, default: Date.now },
});

const orderSchema = new Schema<OrderDocument>({
  product_name: { type: String, required: true },
  buyer_id: String,
  seller_id: String,
  product_id: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  created_at: { type: Date, default: Date.now },
});

const socialPostSchema = new Schema<SocialPostDocument>({
  user_id: { type: String, required: true },
  username: { type: String, required: true },
  avatar: String,
  type: { type: String, enum: ["text", "image"], default: "text" },
  content: String,
  media_url: String,
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

const clanSchema = new Schema<ClanDocument>({
  name: { type: String, required: true },
  description: String,
  creator_id: { type: String, required: true },
  creator_name: { type: String, required: true },
  target_product_id: String,
  target_product_name: String,
  target_price: Number,
  current_funded: { type: Number, default: 0 },
  deadline: Date,
  status: {
    type: String,
    enum: ["active", "completed", "failed"],
    default: "active",
  },
  members: [
    {
      id: String,
      user_id: String,
      username: String,
      avatar: String,
      contributed_amount: Number,
      joined_date: Date,
    },
  ],
  created_at: { type: Date, default: Date.now },
});

// Models
let User: mongoose.Model<UserDocument>;
let Product: mongoose.Model<ProductDocument>;
let Order: mongoose.Model<OrderDocument>;
let SocialPost: mongoose.Model<SocialPostDocument>;
let Clan: mongoose.Model<ClanDocument>;

// Initialize models
const initializeModels = () => {
  try {
    User = mongoose.model<UserDocument>("User", userSchema);
  } catch {
    User = mongoose.model<UserDocument>("User");
  }

  try {
    Product = mongoose.model<ProductDocument>("Product", productSchema);
  } catch {
    Product = mongoose.model<ProductDocument>("Product");
  }

  try {
    Order = mongoose.model<OrderDocument>("Order", orderSchema);
  } catch {
    Order = mongoose.model<OrderDocument>("Order");
  }

  try {
    SocialPost = mongoose.model<SocialPostDocument>("SocialPost", socialPostSchema);
  } catch {
    SocialPost = mongoose.model<SocialPostDocument>("SocialPost");
  }

  try {
    Clan = mongoose.model<ClanDocument>("Clan", clanSchema);
  } catch {
    Clan = mongoose.model<ClanDocument>("Clan");
  }
};

let isConnected = false;

export const isDatabaseConfigured = (): boolean => {
  return isConnected && !!MONGODB_URI;
};

export const connectDatabase = async (): Promise<void> => {
  if (isConnected) return;

  if (!MONGODB_URI) {
    console.warn("MONGODB_URI not configured");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    initializeModels();
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    isConnected = false;
  }
};

// Users
export const createUser = async (
  email: string,
  passwordHash: string,
  name: string,
  phone: string,
  role: "industry" | "buyer"
): Promise<{ id: string; email: string; name: string; role: "industry" | "buyer" }> => {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }

  const user = new User({ email, password_hash: passwordHash, name, phone, role });
  const savedUser = await user.save();

  return {
    id: savedUser._id.toString(),
    email: savedUser.email,
    name: savedUser.name,
    role: savedUser.role,
  };
};

export const getUserByEmail = async (email: string): Promise<any> => {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return await User.findOne({ email });
};

export const getUserById = async (id: string): Promise<any> => {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return await User.findById(id);
};

// Products
export const getProducts = async (limit = 20, offset = 0): Promise<any[]> => {
  if (!isDatabaseConfigured()) {
    return [];
  }

  return await Product.find().skip(offset).limit(limit).lean();
};

export const getProductById = async (id: string): Promise<any> => {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return await Product.findById(id).lean();
};

export const createProduct = async (productData: any): Promise<any> => {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }

  const product = new Product(productData);
  return await product.save();
};

export const updateProduct = async (id: string, productData: any): Promise<any> => {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return await Product.findByIdAndUpdate(id, productData, { new: true });
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (!isDatabaseConfigured()) {
    return false;
  }

  const result = await Product.findByIdAndDelete(id);
  return !!result;
};

// Orders
export const getOrders = async (userId: string): Promise<any[]> => {
  if (!isDatabaseConfigured()) {
    return [];
  }

  return await Order.find({ buyer_id: userId }).lean();
};

export const createOrder = async (
  buyerId: string,
  sellerId: string,
  productId: string,
  quantity: number,
  total: number
): Promise<any> => {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }

  const order = new Order({
    buyer_id: buyerId,
    seller_id: sellerId,
    product_id: productId,
    quantity,
    total,
    product_name: "Order",
    status: "pending",
  });

  return await order.save();
};

// Social posts
export const getSocialPosts = async (limit = 20): Promise<any[]> => {
  if (!isDatabaseConfigured()) {
    return [];
  }

  return await SocialPost.find().sort({ created_at: -1 }).limit(limit).lean();
};

export const createSocialPost = async (
  userId: string,
  content: string,
  imageUrl?: string
): Promise<any> => {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }

  const post = new SocialPost({
    user_id: userId,
    username: "user",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    type: imageUrl ? "image" : "text",
    content,
    media_url: imageUrl,
  });

  return await post.save();
};

// Clans
export const getClans = async (limit = 20, offset = 0): Promise<any[]> => {
  if (!isDatabaseConfigured()) {
    return [];
  }

  return await Clan.find().skip(offset).limit(limit).lean();
};

export const getClanById = async (id: string): Promise<any> => {
  if (!isDatabaseConfigured()) {
    return null;
  }

  return await Clan.findById(id).lean();
};

export const createClan = async (clanData: any): Promise<any> => {
  if (!isDatabaseConfigured()) {
    throw new Error("Database not configured");
  }

  const clan = new Clan(clanData);
  return await clan.save();
};

export const joinClan = async (
  clanId: string,
  userId: string,
  username: string,
  contributionAmount: number
): Promise<any> => {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const clan = await Clan.findById(clanId);
  if (!clan) return null;

  const memberExists = clan.members.some((m: any) => m.user_id === userId);
  if (!memberExists) {
    clan.members.push({
      id: new mongoose.Types.ObjectId().toString(),
      user_id: userId,
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      contributed_amount: contributionAmount,
      joined_date: new Date(),
    });
  } else {
    const member = clan.members.find((m: any) => m.user_id === userId);
    if (member) member.contributed_amount += contributionAmount;
  }

  clan.current_funded += contributionAmount;
  return await clan.save();
};

export const leaveClan = async (clanId: string, userId: string): Promise<any> => {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const clan = await Clan.findById(clanId);
  if (!clan) return null;

  const memberIndex = clan.members.findIndex((m: any) => m.user_id === userId);
  if (memberIndex !== -1) {
    const member = clan.members[memberIndex];
    clan.current_funded -= member.contributed_amount;
    clan.members.splice(memberIndex, 1);
  }

  return await clan.save();
};

// Wallet
export const getWalletBalance = async (
  userId: string,
  currency = "USD"
): Promise<{ balance: number; currency: string }> => {
  return { balance: 0, currency };
};

export const setWalletBalance = async (
  userId: string,
  amount: number,
  currency = "USD"
): Promise<any> => {
  return { success: true };
};

export const getWalletTransactions = async (userId: string): Promise<any[]> => {
  return [];
};

export const addWalletTransaction = async (
  userId: string,
  tx: {
    type: "deposit" | "payment";
    amount: number;
    currency?: string;
    note?: string;
  }
): Promise<any> => {
  return { success: true };
};

// Messaging
export const getConversations = async (userId: string): Promise<any[]> => {
  return [];
};

export const getMessages = async (
  userId: string,
  peerId: string
): Promise<any[]> => {
  return [];
};

export const sendMessage = async (
  senderId: string,
  recipientId: string,
  content?: string,
  mediaUrl?: string
): Promise<any> => {
  return { success: true };
};

// Initialize connection on module load if in Node environment
if (typeof window === "undefined" || process.env.NODE_ENV !== "production") {
  connectDatabase().catch(console.error);
}
