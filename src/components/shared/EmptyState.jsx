import Image from "next/image";

export default function EmptyState({
  image,
  imageAlt = "",
  imageWidth = 200,
  imageHeight = 200,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
    >
      {image && (
        <Image
          src={image}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          className="object-contain mb-4"
        />
      )}
      {title && (
        <p className="text-lg font-semibold text-gray-700 mb-1">{title}</p>
      )}
      {description && (
        <p className="text-sm text-gray-400 mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
