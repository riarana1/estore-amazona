'use server'

import { connectToDatabase } from '@/lib/db'
import Product, { IProduct } from '@/lib/db/models/product.model'
import { FREE_SHIPPING_MIN_PRICE, PAGE_SIZE } from '../constants'
import { OrderItem } from '@/types'
import { round2 } from '../utils'

// Define a type for the plain object returned by .lean()
type LeanProduct = {
  _id: { toString(): string }
} & Omit<IProduct, '_id'>

export async function getAllCategories() {
  await connectToDatabase()
  const categories = await Product.find({ isPublished: true }).distinct(
    'category',
  )
  return categories
}

export async function getProductsForCard({
  tag,
  limit = 4,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  const products = await Product.find(
    { tags: { $in: [tag] }, isPublished: true },
    {
      name: 1,
      href: { $concat: ['/product/', '$slug'] },
      image: { $arrayElemAt: ['$images', 0] },
    },
  )
    .sort({ createdAt: 'desc' })
    .limit(limit)
    /**.lean(): This bypasses the heavy Mongoose document hydration, 
    returning plain objects. This is much faster and prevents "internal" Mongoose 
    state from being leaked to the client */
    .lean()
  return (
    products as unknown as { name: string; href: string; image: string }[]
  ).map((p) => ({
    name: p.name,
    href: p.href,
    image: p.image,
  }))
}

// GET PRODUCTS BY TAG
export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  const products = await Product.find({
    tags: { $in: [tag] },
    isPublished: true,
  })
    .sort({ createdAt: 'desc' })
    .limit(limit)
    .lean()

  const leanProducts = products as unknown as LeanProduct[]
  return leanProducts.map((p) => {
    // Manually pick fields to ensure no nested ObjectIds/Buffers leak to the client
    return {
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      category: p.category,
      images: p.images,
      brand: p.brand,
      price: p.price,
      listPrice: p.listPrice,
      avgRating: p.avgRating,
      numReviews: p.numReviews,
      countInStock: p.countInStock,
      description: p.description,
      tags: p.tags,
      colors: p.colors,
      sizes: p.sizes,
    } as unknown as IProduct
  })
}

// GET ONE PRODUCT BY SLUG
export async function getProductBySlug(slug: string) {
  await connectToDatabase()
  const product = await Product.findOne({ slug, isPublished: true }).lean()
  if (!product) throw new Error('Product not found')
  const p = product as unknown as LeanProduct
  // Explicit mapping ensures serialization safety for the Client Boundary
  return {
    _id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    category: p.category,
    images: p.images,
    brand: p.brand,
    price: p.price,
    listPrice: p.listPrice,
    avgRating: p.avgRating,
    numReviews: p.numReviews,
    countInStock: p.countInStock,
    description: p.description,
    tags: p.tags,
    colors: p.colors,
    sizes: p.sizes,
  } as unknown as IProduct
}
// GET RELATED PRODUCTS: PRODUCTS WITH SAME CATEGORY
export async function getRelatedProductsByCategory({
  category,
  productId,
  limit = PAGE_SIZE,
  page = 1,
}: {
  category: string
  productId: string
  limit?: number
  page: number
}) {
  await connectToDatabase()
  const skipAmount = (Number(page) - 1) * limit
  const conditions = {
    isPublished: true,
    category,
    _id: { $ne: productId },
  }
  const products = await Product.find(conditions)
    .sort({ numSales: 'desc' })
    .skip(skipAmount)
    .limit(limit)
    .lean()
  const productsCount = await Product.countDocuments(conditions).lean()
  const leanProducts = products as unknown as LeanProduct[]
  return {
    data: leanProducts.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      category: p.category,
      images: p.images,
      brand: p.brand,
      price: p.price,
      listPrice: p.listPrice,
      avgRating: p.avgRating,
      numReviews: p.numReviews,
      countInStock: p.countInStock,
      tags: p.tags,
    })) as unknown as IProduct[],
    totalPages: Math.ceil(productsCount / limit),
  }
}

export const calcDeliveryDateAndPrice = async ({
  items,
}: {
  deliveryDateIndex?: number
  items: OrderItem[]
}) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0),
  )

  const shippingPrice = itemsPrice > FREE_SHIPPING_MIN_PRICE ? 0 : 5
  const taxPrice = round2(itemsPrice * 0.15)
  const totalPrice = round2(
    itemsPrice +
      (shippingPrice ? round2(shippingPrice) : 0) +
      (taxPrice ? round2(taxPrice) : 0),
  )
  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  }
}
