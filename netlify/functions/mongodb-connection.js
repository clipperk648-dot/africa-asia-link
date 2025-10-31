const mongoose = require('mongoose');

let isConnected = false;
let connection = null;
const models = {};

// Schema definitions
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['industry', 'buyer'], required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
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
  updated_at: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema({
  buyer_id: String,
  seller_id: String,
  product_id: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const socialPostSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  username: String,
  avatar: String,
  type: { type: String, enum: ['text', 'image'], default: 'text' },
  content: String,
  media_url: String,
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const clanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  creator_id: { type: String, required: true },
  creator_name: { type: String, required: true },
  target_product_id: String,
  target_product_name: String,
  target_price: Number,
  current_funded: { type: Number, default: 0 },
  deadline: Date,
  status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' },
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
  updated_at: { type: Date, default: Date.now },
});

const walletSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  updated_at: { type: Date, default: Date.now },
});

const transactionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  type: { type: String, enum: ['deposit', 'payment'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  note: String,
  created_at: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  sender_id: { type: String, required: true },
  recipient_id: { type: String, required: true },
  content: String,
  media_url: String,
  created_at: { type: Date, default: Date.now },
});

const getConnection = async () => {
  if (isConnected && connection) {
    return connection;
  }

  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    console.error('MONGODB_URI environment variable is not set');
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    connection = await mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
    });

    isConnected = true;

    // Register models
    registerModels();

    console.log('MongoDB connected successfully');
    return connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    isConnected = false;
    throw error;
  }
};

const registerModels = () => {
  try {
    models.User = mongoose.model('User', userSchema);
  } catch {
    models.User = mongoose.model('User');
  }

  try {
    models.Product = mongoose.model('Product', productSchema);
  } catch {
    models.Product = mongoose.model('Product');
  }

  try {
    models.Order = mongoose.model('Order', orderSchema);
  } catch {
    models.Order = mongoose.model('Order');
  }

  try {
    models.SocialPost = mongoose.model('SocialPost', socialPostSchema);
  } catch {
    models.SocialPost = mongoose.model('SocialPost');
  }

  try {
    models.Clan = mongoose.model('Clan', clanSchema);
  } catch {
    models.Clan = mongoose.model('Clan');
  }

  try {
    models.Wallet = mongoose.model('Wallet', walletSchema);
  } catch {
    models.Wallet = mongoose.model('Wallet');
  }

  try {
    models.Transaction = mongoose.model('Transaction', transactionSchema);
  } catch {
    models.Transaction = mongoose.model('Transaction');
  }

  try {
    models.Message = mongoose.model('Message', messageSchema);
  } catch {
    models.Message = mongoose.model('Message');
  }
};

const getModels = async () => {
  await getConnection();
  return models;
};

module.exports = { getConnection, getModels };
