import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'

const app = express()
const port = process.env.PORT || 5000

const catalog = [
  ['Cotton T-Shirt', 'Clothing', 799, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80'],
  ['Canvas Backpack', 'Bags', 1499, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80'],
  ['Ceramic Coffee Mug', 'Home', 499, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=80'],
  ['Running Shoes', 'Footwear', 2499, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80'],
  ['Classic Wristwatch', 'Accessories', 1899, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80'],
  ['Desk Plant Pot', 'Home', 649, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=700&q=80'],
  ['Everyday Sunglasses', 'Accessories', 999, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80'],
  ['Linen Shirt', 'Clothing', 1299, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80'],
  ['Leather Crossbody Bag', 'Bags', 2199, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80'],
  ['Minimal Desk Lamp', 'Home', 1799, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80'],
  ['Wireless Headphones', 'Electronics', 3299, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80'],
  ['Stainless Water Bottle', 'Accessories', 899, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80'],
  ['Ceramic Serving Bowl', 'Kitchen', 749, 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=700&q=80'],
  ['Daily Journal', 'Stationery', 399, 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80'],
  ['Gentle Face Cleanser', 'Beauty', 599, 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=700&q=80'],
  ['Relaxed Chinos', 'Clothing', 1599, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=80'],
  ['AI Intelligence Starter Kit', 'Electronics', 7999, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=700&q=80', 'A practical artificial intelligence and machine learning starter kit for curious builders.'],
  ['AI Laptop for Machine Learning', 'Computers', 68999, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=80', 'Powerful laptop for artificial intelligence, data science, coding, and machine learning workflows.'],
  ['AI Writing Assistant Device', 'Electronics', 12999, 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=700&q=80', 'Smart productivity device with artificial intelligence tools for writing, research, and ideas.'],
  ['Computer Vision Camera', 'Electronics', 8999, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80', 'Intelligent camera for computer vision, smart monitoring, and AI-powered image projects.'],
  ['Data Science Learning Bundle', 'Books', 2499, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=700&q=80', 'Learn Python, data science, artificial intelligence, and machine learning with this study bundle.'],
  ['Smart AI Home Speaker', 'Electronics', 5499, 'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=700&q=80', 'Voice-controlled smart speaker with AI assistant features for everyday home tasks.'],
]

const Product = mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  description: { type: String, default: '' },
}, { timestamps: true }))

app.use(cors())
app.use(express.json())

const authSecret = process.env.AUTH_SECRET || 'dev-only-insecure-secret-change-me'
const tokenTtlMs = 1000 * 60 * 60 * 24 * 7
const avatarPalette = ['#1f513b', '#d65b35', '#c99a3d', '#2d7657', '#7a4f9c', '#20607a']
const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
  phone: { type: String, default: '', trim: true, maxlength: 20 },
  avatarColor: { type: String, default: avatarPalette[0] },
  salt: { type: String, required: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true }))

const Order = mongoose.model('Order', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reference: { type: String, required: true, unique: true },
  method: { type: String, enum: ['upi', 'card', 'cod'], required: true },
  items: [{ name: String, category: String, price: Number, quantity: Number, image: String }],
  total: { type: Number, required: true, min: 0 },
}, { timestamps: true }))

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, passwordHash: crypto.scryptSync(password, salt, 64).toString('hex') }
}

function verifyPassword(password, salt, expectedHash) {
  const candidate = Buffer.from(hashPassword(password, salt).passwordHash, 'hex')
  const expected = Buffer.from(expectedHash, 'hex')
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected)
}

function signToken(userId) {
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt: Date.now() + tokenTtlMs })).toString('base64url')
  const signature = crypto.createHmac('sha256', authSecret).update(payload).digest('base64url')
  return payload + '.' + signature
}

function readToken(token) {
  const [payload, signature] = String(token || '').split('.')
  if (!payload || !signature) return null
  const expected = crypto.createHmac('sha256', authSecret).update(payload).digest('base64url')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof data.userId === 'string' && data.expiresAt > Date.now() ? data : null
  } catch {
    return null
  }
}

function toPublicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, avatarColor: user.avatarColor, createdAt: user.createdAt }
}

function bearerToken(request) {
  const header = request.headers.authorization
  return header && header.startsWith('Bearer ') ? header.slice(7) : ''
}

async function requireAuth(request, response, next) {
  const payload = readToken(bearerToken(request))
  if (!payload) return response.status(401).json({ message: 'Please sig dn in to continue' })
  const user = await User.findById(payload.userId)
  if (!user) return response.status(401).json({ message: 'This session is no longer valid' })
  request.user = user
  return next()
}

app.post('/api/auth/register', async (request, response) => {
  const name = String(request.body?.name || '').trim()
  const email = String(request.body?.email || '').trim().toLowerCase()
  const password = String(request.body?.password || '')
  if (name.length < 2) return response.status(400).json({ message: 'Please enter your full name' })
  if (!emailPattern.test(email)) return response.status(400).json({ message: 'Please enter a valid email address' })
  if (password.length < 8) return response.status(400).json({ message: 'Password must be at least 8 characters' })
  if (await User.exists({ email })) return response.status(409).json({ message: 'An account with this email already exists' })

  const { salt, passwordHash } = hashPassword(password)
  const user = await User.create({ name, email, salt, passwordHash, avatarColor: avatarPalette[Math.floor(Math.random() * avatarPalette.length)] })
  response.status(201).json({ token: signToken(user._id.toString()), user: toPublicUser(user) })
})

app.post('/api/auth/login', async (request, response) => {
  const email = String(request.body?.email || '').trim().toLowerCase()
  const password = String(request.body?.password || '')
  const user = email && password ? await User.findOne({ email }) : null
  if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
    return response.status(401).json({ message: 'Incorrect email or password' })
  }
  response.json({ token: signToken(user._id.toString()), user: toPublicUser(user) })
})

app.get('/api/auth/me', requireAuth, (request, response) => {
  response.json({ user: toPublicUser(request.user) })
})

app.patch('/api/profile', requireAuth, async (request, response) => {
  const name = String(request.body?.name ?? request.user.name).trim()
  const email = String(request.body?.email ?? request.user.email).trim().toLowerCase()
  const phone = String(request.body?.phone ?? request.user.phone).trim()
  if (name.length < 2) return response.status(400).json({ message: 'Please enter your full name' })
  if (!emailPattern.test(email)) return response.status(400).json({ message: 'Please enter a valid email address' })
  if (phone && !/^\d{6,15}$/.test(phone.replace(/\D/g, ''))) return response.status(400).json({ message: 'Please enter a valid phone number' })
  if (email !== request.user.email && (await User.exists({ email }))) return response.status(409).json({ message: 'That email is already in use' })

  request.user.name = name
  request.user.email = email
  request.user.phone = phone
  await request.user.save()
  response.json({ user: toPublicUser(request.user) })
})

app.post('/api/orders', requireAuth, async (request, response) => {
  if (mongoose.connection.readyState !== 1) return response.status(503).json({ message: 'Orders need a database connection' })
  const method = ['upi', 'card', 'cod'].includes(request.body?.method) ? request.body.method : 'cod'
  const requested = Array.isArray(request.body?.items) ? request.body.items.slice(0, 60) : []
  const quantities = new Map()
  for (const item of requested) {
    const quantity = Math.min(20, Math.max(1, Math.round(Number(item?.quantity) || 0)))
    if (mongoose.isValidObjectId(item?.id)) quantities.set(String(item.id), (quantities.get(String(item.id)) || 0) + quantity)
  }
  if (!quantities.size) return response.status(400).json({ message: 'Your cart is empty' })

  const products = await Product.find({ _id: { $in: [...quantities.keys()] } }).lean()
  if (!products.length) return response.status(400).json({ message: 'These products are no longer available' })

  const items = products.map((product) => ({
    name: product.name,
    category: product.category,
    price: product.price,
    quantity: quantities.get(product._id.toString()) || 1,
    image: product.image,
  }))
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const reference = 'SE-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase()
  const order = await Order.create({ user: request.user._id, reference, method, items, total })
  response.status(201).json({ order: { id: order._id.toString(), reference, method, total, items, createdAt: order.createdAt } })
})

app.get('/api/orders', requireAuth, async (request, response) => {
  if (mongoose.connection.readyState !== 1) return response.status(503).json({ message: 'Orders need a database connection' })
  const orders = await Order.find({ user: request.user._id }).sort({ createdAt: -1 }).limit(30).lean()
  response.json({ orders: orders.map((order) => ({
    id: order._id.toString(),
    reference: order.reference,
    method: order.method,
    total: order.total,
    items: order.items,
    createdAt: order.createdAt,
  })) })
})

const distDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')

app.get('/api/health', (_request, response) => {
  response.json({ connected: mongoose.connection.readyState === 1 })
})

app.get('/api/products', async (request, response) => {
  if (mongoose.connection.readyState !== 1) {
    return response.status(503).json({ message: 'MongoDB is not connected' })
  }

  try {
    const { category, search } = request.query
    const query = {}
    if (category && category !== 'All') query.category = category
    const searchTerms = search?.trim().split(/\s+/).filter(Boolean) || []
    if (searchTerms.length) {
      query.$and = searchTerms.map((term) => ({
        $or: ['name', 'category', 'description'].map((field) => ({ [field]: { $regex: term, $options: 'i' } })),
      }))
    }
    const products = await Product.find(query).sort({ createdAt: 1 }).lean()
    response.json(products.map((product) => ({ ...product, id: product._id.toString(), _id: undefined })))
  } catch (error) {
    response.status(500).json({ message: 'Unable to load products', error: error.message })
  }
})

app.use(express.static(distDirectory))

app.get(/^\/(?!api\/).*/, (request, response, next) => {
  response.sendFile(path.join(distDirectory, 'index.html'), (error) => (error ? next() : undefined))
})

async function seedProducts() {
  const products = catalog.map(([name, category, price, image, description = '']) => ({ name, category, price, image, description }))
  await Product.bulkWrite(products.map((product) => ({
    updateOne: { filter: { name: product.name }, update: { $set: product }, upsert: true },
  })))
  console.log(`Synced ${catalog.length} catalog products`)
}

async function startServer() {
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI)
    await seedProducts()
    await Promise.all([User.createIndexes(), Order.createIndexes()])
    console.log('Connected to MongoDB')
  } else {
    console.log('MONGODB_URI is not set; API started without a database connection')
  }

  app.listen(port, () => console.log(`API listening on http://localhost:${port}`))
}

startServer().catch((error) => {
  console.error('Unable to start API:', error.message)
  process.exit(1)
})