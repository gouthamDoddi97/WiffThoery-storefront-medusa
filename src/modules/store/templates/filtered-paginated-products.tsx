import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getPerfumeDetails } from "@lib/data/perfume-details"
import { PerfumeDetails } from "types/perfume"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import ProductPreview from "@modules/products/components/product-preview"
import ProductPreviewHorizontal from "@modules/products/components/product-preview/horizontal"
import ProductPreviewLarge from "@modules/products/components/product-preview/large"
import ProductSlider from "./product-slider"

// ─── Note family keyword map ──────────────────────────────────────────────────

const NOTE_KEYWORDS: Record<string, string[]> = {
  Citrus: ["citrus", "lemon", "bergamot", "orange", "grapefruit", "lime", "mandarin", "neroli"],
  Floral: ["floral", "rose", "jasmine", "lily", "violet", "iris", "peony", "magnolia", "ylang", "flower"],
  Woody: ["wood", "cedar", "sandalwood", "vetiver", "oud", "patchouli", "birch", "teak"],
  Musky: ["musk", "musky", "ambergris", "ambrette"],
  Spicy: ["spicy", "pepper", "cardamom", "ginger", "cinnamon", "clove", "nutmeg", "saffron"],
  Fresh: ["fresh", "aquatic", "water", "sea", "marine", "cucumber", "green", "mint", "clean"],
  Sweet: ["sweet", "vanilla", "caramel", "honey", "chocolate", "praline", "sugar"],
  Fruity: ["fruity", "fruit", "peach", "apple", "pear", "berry", "plum", "cherry", "fig", "mango"],
  Amber: ["amber", "ambre", "benzoin", "labdanum", "tonka", "resin", "balsam"],
  Leather: ["leather", "tobacco", "smoke", "incense", "moss", "suede"],
}

function matchesNoteFamilies(
  details: PerfumeDetails | null,
  families: string[]
): boolean {
  if (families.length === 0) return true
  if (!details) return false
  const allNotes = [details.top_notes, details.middle_notes, details.base_notes]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return families.some((family) => {
    const kws = NOTE_KEYWORDS[family] ?? [family.toLowerCase()]
    return kws.some((kw) => allNotes.includes(kw))
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

type Layout = "default" | "wave" | "s-curve" | "scattered"

type Props = {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  countryCode: string
  layout?: Layout
  longevity?: string[]
  sillage?: string[]
  notes?: string[]
}

export default async function FilteredPaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  countryCode,
  layout = "default",
  longevity = [],
  sillage = [],
  notes = [],
}: Props) {
  const region = await getRegion(countryCode)
  if (!region) return null

  const queryParams: {
    limit: number
    collection_id?: string[]
    category_id?: string[]
    order?: string
  } = { limit: 100 }

  if (collectionId) queryParams.collection_id = [collectionId]
  if (categoryId) queryParams.category_id = [categoryId]
  if (sortBy === "created_at") queryParams.order = "created_at"

  const {
    response: { products: allProducts },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  // ── Apply filters ────────────────────────────────────────────────────────────

  const hasFilters = longevity.length > 0 || sillage.length > 0 || notes.length > 0

  let products = allProducts

  if (hasFilters) {
    const detailsArr = await Promise.all(
      allProducts.map((p) => getPerfumeDetails(p.id))
    )

    products = allProducts.filter((_, i) => {
      const d = detailsArr[i]
      if (longevity.length > 0 && (!d?.longevity || !longevity.includes(d.longevity)))
        return false
      if (sillage.length > 0 && (!d?.sillage || !sillage.includes(d.sillage)))
        return false
      if (!matchesNoteFamilies(d, notes)) return false
      return true
    })
  }

  // ── Empty state ──────────────────────────────────────────────────────────────

  if (products.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-center">
        <p className="font-inter text-sm text-on-surface-variant">
          No fragrances match these filters.
        </p>
        <p className="font-inter text-[10px] tracking-[0.15em] uppercase text-on-surface-disabled">
          Try removing one or more filters
        </p>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const productNodes = products.map((p, index) => {
    if (layout === "s-curve") {
      return (
        <ProductPreviewHorizontal
          key={`${p.id}-${index}`}
          product={p}
          index={index}
          region={region}
        />
      )
    }
    if (layout === "wave") {
      return (
        <ProductPreviewLarge
          key={`${p.id}-${index}`}
          product={p}
          region={region}
        />
      )
    }
    if (layout === "scattered") {
      return index % 3 === 2 ? (
        <ProductPreviewHorizontal
          key={`${p.id}-${index}`}
          product={p}
          index={Math.floor(index / 3)}
          region={region}
        />
      ) : (
        <ProductPreviewLarge
          key={`${p.id}-${index}`}
          product={p}
          region={region}
        />
      )
    }
    return (
      <ProductPreview key={`${p.id}-${index}`} product={p} region={region} />
    )
  })

  return <ProductSlider items={productNodes} layout={layout} />
}
