import Image from 'next/image'
import Link from 'next/link'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { IProduct } from '@/lib/db/models/product.model'

import Rating from './rating'
import { formatNumber } from '@/lib/utils'
import ProductPrice from './product-price'
import ImageHover from './image-hover'

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
        <div className="relative h-52">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="80vw"
            className="object-contain"
          />
        </div>
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

const ProductCard = ({
  product,
  hideBorder = false,
  hideDetails = false,
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
        </>
      )}
    </Card>
  )
}

export default ProductCard
