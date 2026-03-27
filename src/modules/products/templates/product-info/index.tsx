import { getPerfumeDetails } from "@lib/data/perfume-details"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = async ({ product }: ProductInfoProps) => {
  const perfume = await getPerfumeDetails(product.id)

  return (
    <div id="product-info" className="flex flex-col gap-6">
      {/* Breadcrumb / collection link */}
      {product.collection && (
        <div className="flex items-center gap-2">
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="font-inter text-[10px] tracking-[0.2em] uppercase text-on-surface-variant hover:text-primary transition-colors"
          >
            {product.collection.title}
          </LocalizedClientLink>
          <span className="text-on-surface-disabled text-[10px]">/</span>
          <span className="font-inter text-[10px] tracking-[0.2em] uppercase text-on-surface-disabled">
            {product.title}
          </span>
        </div>
      )}

      {/* Product name */}
      <h1
        className="font-grotesk font-bold text-4xl small:text-5xl text-on-surface tracking-[-0.03em] leading-[0.92]"
        data-testid="product-title"
      >
        {product.title}
      </h1>

      {/* Tagline / certifications */}
      {perfume?.certifications && (
        <p className="font-inter text-sm italic text-on-surface-variant">
          {perfume.certifications}
        </p>
      )}

      {/* Description */}
      {product.description && (
        <p
          className="font-inter text-sm text-on-surface-variant leading-relaxed whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </p>
      )}

      {/* Scent Story */}
      {perfume?.scent_story && (
        <div className="border-t border-surface-variant/30 pt-5">
          <h3 className="font-grotesk font-semibold text-[11px] tracking-[0.2em] uppercase text-primary mb-3">
            THE IMPRESSION
          </h3>
          <p className="font-inter text-sm text-on-surface-variant leading-relaxed italic">
            {perfume.scent_story}
          </p>
        </div>
      )}

      {/* Fragrance Notes */}
      {(perfume?.top_notes || perfume?.middle_notes || perfume?.base_notes) && (
        <div className="border-t border-surface-variant/30 pt-5 flex flex-col gap-3">
          <h3 className="font-grotesk font-semibold text-[11px] tracking-[0.2em] uppercase text-primary">
            OLFACTORY BLUEPRINT
          </h3>
          {[
            { label: "TOP NOTES", value: perfume.top_notes },
            { label: "MIDDLE NOTES", value: perfume.middle_notes },
            { label: "BASE NOTES", value: perfume.base_notes },
          ]
            .filter((n) => n.value)
            .map((note) => (
              <div key={note.label}>
                <span className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled block mb-1">
                  {note.label}
                </span>
                <p className="font-inter text-sm text-on-surface-variant">{note.value}</p>
              </div>
            ))}
        </div>
      )}

      {/* Usage Tips */}
      {perfume?.usage_tips && (
        <div className="border-t border-surface-variant/30 pt-5">
          <h3 className="font-grotesk font-semibold text-[11px] tracking-[0.2em] uppercase text-primary mb-3">
            APPLICATION TIPS
          </h3>
          <p className="font-inter text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
            {perfume.usage_tips}
          </p>
        </div>
      )}

      {/* Ingredients */}
      {perfume?.ingredients && (
        <div className="border-t border-surface-variant/30 pt-5">
          <h3 className="font-grotesk font-semibold text-[11px] tracking-[0.2em] uppercase text-on-surface-variant mb-3">
            INGREDIENTS
          </h3>
          <p className="font-inter text-xs text-on-surface-disabled leading-relaxed whitespace-pre-line">
            {perfume.ingredients}
          </p>
        </div>
      )}

      {/* Brand & Manufacturer */}
      {(perfume?.brand_info || perfume?.manufacturer_info || perfume?.license_no) && (
        <div className="border-t border-surface-variant/30 pt-5 flex flex-col gap-2">
          <h3 className="font-grotesk font-semibold text-[11px] tracking-[0.2em] uppercase text-on-surface-variant mb-1">
            BRAND INFO
          </h3>
          {[
            { label: "Marketed By", value: perfume.brand_info },
            { label: "Manufactured By", value: perfume.manufacturer_info },
            { label: "License No.", value: perfume.license_no },
          ]
            .filter((f) => f.value)
            .map((field) => (
              <p key={field.label} className="font-inter text-xs text-on-surface-disabled">
                <span className="text-on-surface-variant">{field.label}: </span>
                {field.value}
              </p>
            ))}
        </div>
      )}

      {/* Expiry & Customer Care */}
      {(perfume?.expiry_info || perfume?.customer_care) && (
        <div className="border-t border-surface-variant/30 pt-5 flex flex-col gap-2">
          {[
            { label: "Expiry", value: perfume.expiry_info },
            { label: "Customer Care", value: perfume.customer_care },
          ]
            .filter((f) => f.value)
            .map((field) => (
              <p key={field.label} className="font-inter text-xs text-on-surface-disabled">
                <span className="text-on-surface-variant">{field.label}: </span>
                {field.value}
              </p>
            ))}
        </div>
      )}
    </div>
  )
}

export default ProductInfo

