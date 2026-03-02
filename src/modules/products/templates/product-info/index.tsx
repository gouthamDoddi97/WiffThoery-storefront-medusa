import { getPerfumeDetails } from "@lib/data/perfume-details"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = async ({ product }: ProductInfoProps) => {
  const perfume = await getPerfumeDetails(product.id)

  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        {/* Certifications badge row */}
        {perfume?.certifications && (
          <p className="text-small-regular text-ui-fg-muted tracking-wide uppercase">
            {perfume.certifications}
          </p>
        )}

        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>

        {/* Fragrance Notes */}
        {(perfume?.top_notes || perfume?.middle_notes || perfume?.base_notes) && (
          <div className="flex flex-col gap-y-1 border-t border-ui-border-base pt-4">
            <p className="text-base-semi text-ui-fg-base">Fragrance Notes</p>
            {perfume.top_notes && (
              <p className="text-small-regular text-ui-fg-subtle">
                <span className="font-medium text-ui-fg-base">Top: </span>
                {perfume.top_notes}
              </p>
            )}
            {perfume.middle_notes && (
              <p className="text-small-regular text-ui-fg-subtle">
                <span className="font-medium text-ui-fg-base">Middle: </span>
                {perfume.middle_notes}
              </p>
            )}
            {perfume.base_notes && (
              <p className="text-small-regular text-ui-fg-subtle">
                <span className="font-medium text-ui-fg-base">Base: </span>
                {perfume.base_notes}
              </p>
            )}
          </div>
        )}

        {/* Scent Story */}
        {perfume?.scent_story && (
          <div className="flex flex-col gap-y-1 border-t border-ui-border-base pt-4">
            <p className="text-base-semi text-ui-fg-base">Scent Story</p>
            <Text className="text-medium text-ui-fg-subtle whitespace-pre-line">
              {perfume.scent_story}
            </Text>
          </div>
        )}

        {/* Usage Tips */}
        {perfume?.usage_tips && (
          <div className="flex flex-col gap-y-1 border-t border-ui-border-base pt-4">
            <p className="text-base-semi text-ui-fg-base">Usage Tips</p>
            <Text className="text-medium text-ui-fg-subtle whitespace-pre-line">
              {perfume.usage_tips}
            </Text>
          </div>
        )}

        {/* Ingredients */}
        {perfume?.ingredients && (
          <div className="flex flex-col gap-y-1 border-t border-ui-border-base pt-4">
            <p className="text-base-semi text-ui-fg-base">Ingredients</p>
            <Text className="text-medium text-ui-fg-subtle whitespace-pre-line">
              {perfume.ingredients}
            </Text>
          </div>
        )}

        {/* Brand & Manufacturer */}
        {(perfume?.brand_info || perfume?.manufacturer_info || perfume?.license_no) && (
          <div className="flex flex-col gap-y-2 border-t border-ui-border-base pt-4">
            <p className="text-base-semi text-ui-fg-base">Brand & Manufacturer Info</p>
            {perfume.brand_info && (
              <Text className="text-small-regular text-ui-fg-subtle whitespace-pre-line">
                <span className="font-medium text-ui-fg-base">Marketed By: </span>
                {perfume.brand_info}
              </Text>
            )}
            {perfume.manufacturer_info && (
              <Text className="text-small-regular text-ui-fg-subtle whitespace-pre-line">
                <span className="font-medium text-ui-fg-base">Manufactured By: </span>
                {perfume.manufacturer_info}
              </Text>
            )}
            {perfume.license_no && (
              <p className="text-small-regular text-ui-fg-subtle">
                <span className="font-medium text-ui-fg-base">License No.: </span>
                {perfume.license_no}
              </p>
            )}
          </div>
        )}

        {/* Expiry & Customer Care */}
        {(perfume?.expiry_info || perfume?.customer_care) && (
          <div className="flex flex-col gap-y-1 border-t border-ui-border-base pt-4">
            {perfume.expiry_info && (
              <p className="text-small-regular text-ui-fg-subtle">
                <span className="font-medium text-ui-fg-base">Expiry: </span>
                {perfume.expiry_info}
              </p>
            )}
            {perfume.customer_care && (
              <p className="text-small-regular text-ui-fg-subtle">
                <span className="font-medium text-ui-fg-base">Customer Care: </span>
                {perfume.customer_care}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
