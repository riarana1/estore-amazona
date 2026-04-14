import Image from 'next/image'
import Link from 'next/link'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { IProduct } from '@/lib/db/models/product.model'

import Rating from './rating'
import { formatNumber, generateId, round2 } from '@/lib/utils'
import ProductPrice from './product-price'
import ImageHover from './image-hover'
import AddToCart from './add-to-cart'

const ProductImage = ({ product }: { product: IProduct }) => (
  <Link href={`/product/${product.slug}`}>
    <div className="relative h-52">
      {product.images.length > 1 ? (
        <ImageHover
          src={product.images[0]}
          hoverSrc={product.images[1]}
          alt={product.name}
        />
      ) : (
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="80vw"
          style={{ objectFit: 'contain' }}
        />
      )}
    </div>
  </Link>
)

const ProductDetails = ({ product }: { product: IProduct }) => (
  <div className="flex-1 space-y-2">
    <p className="font-bold">{product.brand}</p>
    <Link
      href={`/product/${product.slug}`}
      className="overflow-hidden text-ellipsis"
      style={{
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}
    >
      {product.name}
    </Link>
    <div className="flex gap-2 justify-center">
      <Rating rating={product.avgRating} />
      <span>({formatNumber(product.numReviews)})</span>
    </div>

    <ProductPrice
      isDeal={product.tags.includes('todays-deal')}
      price={product.price}
      listPrice={product.listPrice}
      forListing
    />
  </div>
)

const AddButton = ({ product }: { product: IProduct }) => (
  <div className="w-full text-center">
    <AddToCart
      minimal
      item={{
        clientId: generateId(),
        product: product._id.toString(),
        size: product.sizes[0],
        color: product.colors[0],
        countInStock: product.countInStock,
        name: product.name,
        slug: product.slug,
        category: product.category,
        price: round2(product.price),
        quantity: 1,
        image: product.images[0],
      }}
    />
  </div>
)

const ProductCard = ({
  product,
  hideBorder = false,
  hideDetails = false,
  hideAddToCart = false,
}: {
  product: IProduct
  hideDetails?: boolean
  hideBorder?: boolean
  hideAddToCart?: boolean
}) => {
  return hideBorder ? (
    <div className="flex flex-col">
      <ProductImage product={product} />
      {!hideDetails && (
        <>
          <div className="p-3 flex-1 text-center">
            <ProductDetails product={product} />
          </div>
          {!hideAddToCart && <AddButton product={product} />}
        </>
      )}
    </div>
  ) : (
    <Card className="flex flex-col  ">
      <CardHeader className="p-3">
        <ProductImage product={product} />
      </CardHeader>
      {!hideDetails && (
        <>
          <CardContent className="p-3 flex-1 text-center">
            <ProductDetails product={product} />
          </CardContent>
          <CardFooter className="p-3">
            {!hideAddToCart && <AddButton product={product} />}
          </CardFooter>
        </>
      )}
    </Card>
  )
}

export default ProductCard
