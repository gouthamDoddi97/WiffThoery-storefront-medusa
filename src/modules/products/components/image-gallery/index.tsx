import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  layout?: "vertical" | "horizontal"
}

const ImageGallery = ({ images, layout = "vertical" }: ImageGalleryProps) => {
  const isHorizontal = layout === "horizontal"

  return (
    <div className="flex items-start relative">
      <div
        className={
          isHorizontal
            ? "flex flex-row flex-1 small:mx-16 gap-x-4 overflow-x-auto"
            : "flex flex-col flex-1 small:mx-16 gap-y-4"
        }
      >
        {images.map((image, index) => {
          return (
            <Container
              key={image.id}
              className={
                isHorizontal
                  ? "relative aspect-[29/34] flex-shrink-0 w-[280px] small:w-[360px] overflow-hidden bg-ui-bg-subtle"
                  : "relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle"
              }
              id={image.id}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  priority={index <= 2 ? true : false}
                  className="absolute inset-0 rounded-rounded"
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                  style={{
                    objectFit: "cover",
                  }}
                />
              )}
            </Container>
          )
        })}
      </div>
    </div>
  )
}

export default ImageGallery
