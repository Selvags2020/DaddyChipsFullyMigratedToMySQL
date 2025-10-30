import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ProductCard({ product }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 w-full">
        <Image
          src={product.productImage}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="transition-opacity duration-300"
          style={{ opacity: isHovered ? 0.9 : 1 }}
        />
        {product.offerPrice < product.standardPrice && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
          <div className="flex flex-col items-end">
            {product.offerPrice < product.standardPrice ? (
              <>
                <span className="text-lg font-bold text-red-600">${product.offerPrice}</span>
                <span className="text-sm text-gray-500 line-through">${product.standardPrice}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-800">${product.standardPrice}</span>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{product.description}</p>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-gray-500">{product.categoryName}</span>
          <button 
            onClick={() => router.push(`/product/${product.id}`)}
            className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}