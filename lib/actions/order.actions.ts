'use server'

import { Cart, OrderItem, ShippingAddress } from '@/types'
import { formatError, FormattableError } from '../utils'
import { getSetting } from './setting.actions'
import { OrderInputSchema } from '../validator'

import { connectToDatabase } from '../db'
import { auth } from '@/auth'
import Order from '../db/models/order.model'
import { calculateCartPrices } from '../utils'

// CREATE
export const createOrder = async (clientSideCart: Cart) => {
  try {
    await connectToDatabase()
    const session = await auth()
    if (!session) throw new Error('User not authenticated')
    // recalculate price and delivery date on the server
    const createdOrder = await createOrderFromCart(
      clientSideCart,
      session.user.id!,
    )
    return {
      success: true,
      message: 'Order placed successfully',
      data: { orderId: createdOrder._id.toString() },
    }
  } catch (error) {
    return { success: false, message: formatError(error as FormattableError) }
  }
}

export const createOrderFromCart = async (
  clientSideCart: Cart,
  userId: string,
) => {
  const cart = {
    ...clientSideCart,
    ...(await calcDeliveryDateAndPrice({
      items: clientSideCart.items,
      shippingAddress: clientSideCart.shippingAddress,
      deliveryDateIndex: clientSideCart.deliveryDateIndex,
    })),
  }

  const order = OrderInputSchema.parse({
    user: userId,
    items: cart.items,
    shippingAddress: cart.shippingAddress,
    paymentMethod: cart.paymentMethod,
    itemsPrice: cart.itemsPrice,
    shippingPrice: cart.shippingPrice,
    taxPrice: cart.taxPrice,
    totalPrice: cart.totalPrice,
    expectedDeliveryDate: cart.expectedDeliveryDate,
  })
  return await Order.create(order)
}

export const calcDeliveryDateAndPrice = async ({
  items,
  shippingAddress,
  deliveryDateIndex,
}: {
  deliveryDateIndex?: number
  items: OrderItem[]
  shippingAddress?: ShippingAddress
}) => {
  const { availableDeliveryDates } = await getSetting()
  const prices = calculateCartPrices({
    items,
    shippingAddress,
    deliveryDateIndex,
    availableDeliveryDates,
  })
  return {
    availableDeliveryDates,
    ...prices,
  }
}
