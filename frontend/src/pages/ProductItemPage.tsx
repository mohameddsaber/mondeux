import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BadgeCheck, ChevronDown, Star } from 'lucide-react';
import ProductImageSlider from '../components/ProductImageSlider.tsx';
import ProductAccordian from '../components/ProductAccordian.tsx';
import RelatedProducts from '../components/RelatedProducts.tsx';
import TrustBadges from '../components/TrustBadges.tsx';
import WishlistButton from '../components/WishlistButton.tsx';
import { getApiErrorMessage } from '../lib/api';
import {
  useAddToCartMutation,
  useCreateProductReviewMutation,
  useCurrentUserQuery,
  useProductDetailQuery,
  useProductReviewsQuery,
} from '../hooks/useStoreData';
import { trackClientEvent } from '../lib/analytics';
import { toast } from 'sonner';


export interface SizeVariant {
  label: string; 
  sku: string;
  stock: number;
  price?: number; 
  isAvailable: boolean;
}

export interface MaterialVariant {
  material: "gold" | "silver" | "stainless steel";
  metalPurity?: string;
  weight?: number;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  sizeVariants: SizeVariant[];
}

export interface ProductDetails {
  _id: string;
  name: string;
  slug: string;
  description: string;
  metaDescription?: string; 
  images: { url: string; alt: string; isPrimary: boolean }[];
  category: { name: string; slug: string } | null; 
  subCategory: { name: string; slug: string } | null;
  materialVariants: MaterialVariant[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  numReviews: number;
  createdAt: string;
}


const ProductItemPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); 
  const navigate = useNavigate(); 

  const [error, setError] = useState<string | null>(null);

  // 🎯 FIX: Changed to store the material name string
  const [selectedMaterialName, setSelectedMaterialName] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeVariant | null>(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const quantity = 1;
  const addToCartMutation = useAddToCartMutation();
  const trackedProductViewRef = useRef("");
  const currentUserQuery = useCurrentUserQuery();
  
  const productQuery = useProductDetailQuery(slug || "");
  const product = (productQuery.data?.data as ProductDetails | undefined) ?? null;
  const relatedProducts = productQuery.data?.relatedProducts || [];
  const reviewsQuery = useProductReviewsQuery(product?._id || '');
  const createReviewMutation = useCreateProductReviewMutation(product?._id || '');
  const loading = productQuery.isPending;
  const queryError = productQuery.error
    ? getApiErrorMessage(productQuery.error, "Failed to load product")
    : null;
  const approvedReviews = reviewsQuery.data?.items || [];
  const reviewStats = reviewsQuery.data?.stats || {
    averageRating: product?.rating || 0,
    totalReviews: product?.numReviews || 0,
  };
  const viewerReview = reviewsQuery.data?.viewerReview || null;

  useEffect(() => {
    if (!product) {
      setSelectedMaterialName(null);
      setSelectedSize(null);
      setReviewRating(5);
      setReviewTitle('');
      setReviewComment('');
      return;
    }

    if (product.materialVariants.length === 0) {
      return;
    }

    const initialMaterial = product.materialVariants[0];
    setSelectedMaterialName(initialMaterial.material);

    if (initialMaterial.sizeVariants.length > 0) {
      const initialSize =
        initialMaterial.sizeVariants.find((s) => s.isAvailable && s.stock > 0) ||
        initialMaterial.sizeVariants[0];
      setSelectedSize(initialSize);
    }
  }, [product]);

  useEffect(() => {
    if (!product) {
      return;
    }

    if (trackedProductViewRef.current === product._id) {
      return;
    }

    trackedProductViewRef.current = product._id;

    trackClientEvent({
      eventType: "product_view",
      productId: product._id,
      metadata: {
        slug: product.slug,
        category: product.category?.slug || "",
        subCategory: product.subCategory?.slug || "",
      },
    });
  }, [product]);


  const selectedMaterial = product?.materialVariants.find(
    v => v.material === selectedMaterialName
  ) || null;


  const finalPrice = selectedSize?.price ?? selectedMaterial?.price ?? product?.materialVariants[0]?.price ?? 0;
  const displayPrice = finalPrice; 
  const isAvailable = selectedSize ? selectedSize.stock > 0 : false;
  const imageUrls = product?.images.map(img => img.url) || [];

  const selectedVariantLabel = selectedSize?.label 
    ? `${(selectedMaterialName || '').toUpperCase()} - ${selectedSize.label}`
    : (selectedMaterialName || '').toUpperCase() || 'Select Variant';


    const currentSizeOptions = selectedMaterial?.sizeVariants.map(s => ({
      id: `${selectedMaterial.material}-${s.sku}`,
      label: s.label,
      material: selectedMaterial,
      size: s,
      isAvailable: s.isAvailable && s.stock > 0
  })) || [];


  const handleMaterialSelect = (materialName: string) => {
    setSelectedMaterialName(materialName); 
    
    const newMaterialVariant = product?.materialVariants.find(v => v.material === materialName);

    if (newMaterialVariant) {

      const initialSize = newMaterialVariant.sizeVariants.find(s => s.isAvailable && s.stock > 0) || newMaterialVariant.sizeVariants[0];
        setSelectedSize(initialSize);

        setIsDropdownOpen(false);
    }
  };


  const handleAddToCart = async () => {

    if (!product || !selectedMaterial || !selectedSize || finalPrice <= 0 || !isAvailable) {
      console.error("Cannot add to cart: Missing required variant information or item is unavailable.");

      setError("Please ensure you have selected an available variant.");
      return;
    }
    
    setAddedToCart(true); 

    try {

      const payload = {
        productId: product._id, 
        size: selectedSize.label, 
        material: selectedMaterial.material,
        price: finalPrice, 
        quantity: quantity, 
      };

      await addToCartMutation.mutateAsync(payload); 


      setTimeout(() => {
        setAddedToCart(false);
      }, 3000); 

    } catch (error) {
      console.error("Failed to add item to cart:", error);
      setError("Failed to add item to cart. Please check console for details.");
      setAddedToCart(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      toast.error('Review comment is required');
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });
      setReviewRating(5);
      setReviewTitle('');
      setReviewComment('');
      toast.success('Review submitted and pending moderation');
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError, 'Failed to submit review'));
    }
  };


  const getProductDetails = (product: ProductDetails, material: MaterialVariant | null): string[] => {

    if (!product || !material) return [];

    const detailsArray: string[] = [];

    const materialLine = [];
    if (material.metalPurity) {
        materialLine.push(material.metalPurity);
    }
    materialLine.push(material.material.charAt(0).toUpperCase() + material.material.slice(1));
    detailsArray.push(materialLine.join(' '));


    const descriptionToUse = product.metaDescription || product.description;
    if (descriptionToUse) {


      const featureLine = descriptionToUse.split(/[.!?]/)[0].trim();
        if (featureLine.length > 0) {
            detailsArray.push(featureLine);
        }
    }

    detailsArray.push("Mondeux branding");
    detailsArray.push("Hallmarked by the Mondeux' Company Assay Office");


    if (material.sizeVariants.length > 0) {

      const uniqueSizes = material.sizeVariants
            .map(v => v.label)
            .filter((value, index, self) => self.indexOf(value) === index);
        
        detailsArray.push(`Available in ${uniqueSizes.join(', ')}`);
    }


    if (material.weight) {
        detailsArray.push(`This product weighs ${material.weight}g`);
    }
    
    return detailsArray;
  };

  const details = product ? getProductDetails(product, selectedMaterial) : [];

  if (!slug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Product slug is missing.</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if ((queryError || error || !product) && !addedToCart) { 
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center ">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">Error</h1>
          <p className="text-xl mb-8 text-red-600">{queryError || error || 'Product not found.'}</p>
          <button
            onClick={() => {
              setError(null);
              navigate('/products');
            }}
            className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 ">
      <main className="max-w-9xl mx-auto"> 
        <div className="grid md:grid-cols-2 gap-10">
          {/* Product Image */}
          <div>
            <ProductImageSlider images={imageUrls} /> 
            <div className='md:block hidden pl-4'><TrustBadges /></div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col pt-15 px-[47px] xl:px-[80px]">
            <div className="mb-2 flex items-start justify-between gap-4">
              <h2 className="text-[24px] font-ui text-[#121212]">{product?.name}</h2>
              <WishlistButton productId={product!._id} className="shrink-0" />
            </div>
            {/* Display the calculated final price */}
            <p className="text-[19px] text-gray-600 mb-6">LE {displayPrice.toFixed(2)}</p>

            {/* Product Details*/}
            <div className="mb-6">
              {details.map((detail, index) => (
                <p key={index} className="text-[12px] text-[#121212] leading-relaxed">
                  - {detail}
                </p>
              ))}
            </div>

            <div className="max-w-lg w-full"> 
              
              {/* 🎯 New Material Selector UI */}
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2">Material: <span className="font-normal">{selectedMaterialName?.toUpperCase() || ''}</span></p>
                <div className="flex gap-2 mb-4">
                  {product?.materialVariants.map(variant => (
                    <button
                      key={variant.material}
                      onClick={() => handleMaterialSelect(variant.material)}
                      className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 border-2 
                        ${
                          variant.material === selectedMaterialName
                            ? "bg-black text-white border-black shadow-md"
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                        }`
                      }
                    >
                      {variant.material.charAt(0).toUpperCase() + variant.material.slice(1)}
                    </button>
                  ))}
                </div>
              </div>


              {/* Variant Selector (Size Only) */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="relative flex-1 mr-4">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 border border-gray-300 rounded bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
                    >
                      <span>{selectedVariantLabel}</span> 
                      <ChevronDown size={20} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                        {/* Now maps over currentSizeOptions */}
                        {currentSizeOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => {

                              setSelectedSize(option.size);
                              setIsDropdownOpen(false);
                            }}
                            disabled={!option.isAvailable}
                            className={`w-full px-4 py-3 text-left transition-colors ${
                              (selectedSize?.label === option.size.label)
                                ? 'bg-gray-100 font-semibold' 
                                : 'hover:bg-gray-50'
                            } ${!option.isAvailable ? 'text-gray-400 cursor-not-allowed' : ''}`}
                          >
                            {/* Display only the size label */}
                            {option.label}
                            {!option.isAvailable && ' (Sold Out)'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button className="text-sm underline whitespace-nowrap hover:text-gray-600">
                    Size Guide
                  </button>
                </div>
              </div>

              {/* Add to Cart Button (Updated onClick logic) */}
              <button 
                onClick={handleAddToCart}
                disabled={!selectedSize || !isAvailable || addedToCart}
                className={`w-full py-3 border text-[12px] transition-all mb-3 ${
                  addedToCart 
                    ? 'bg-green-600 text-white border-green-600' 
                    : isAvailable 
                        ? 'bg-white border-black text-black hover:bg-black hover:text-white'
                        : 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {!selectedSize ? 'SELECT VARIANT' : (isAvailable ? (addedToCart ? 'ADDED TO CART ✓' : 'ADD TO CART') : 'SOLD OUT')}
              </button>

              {/* Other Buttons */}
              <button className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors mb-3">
                Buy with Shop
              </button>

              <button className="w-full text-[12px] text-center underline mb-8 hover:text-gray-600">
                More payment options
              </button>

              {/* Visual Search */}
              <div className="border border-gray-200 py-[18px] px-[22px] flex items-start gap-4">
                <div>
                  <p className="text-sm font-semibold mb-[-3px]">View Visually</p>
                  <p className="text-sm font-semibold mb-3">Similar Products</p>
                  <button className="text-md text-white bg-gray-300 py-1.5 px-8 cursor-pointer font-semibold">
                    Explore Now ›
                  </button>
                </div>
              </div>
              <ProductAccordian description={product?.description ?? ""} />
            </div>
          </div>
        </div>
        
        <div className='md:hidden block px-8'><TrustBadges /></div>
        <section className="mx-auto mt-16 max-w-7xl px-6 pb-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Customer Reviews</p>
              <div className="mt-4 flex items-end gap-4">
                <div className="text-5xl font-bold text-[#121212]">
                  {Number(reviewStats.averageRating || 0).toFixed(1)}
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`h-4 w-4 ${
                          value <= Math.round(reviewStats.averageRating || 0)
                            ? 'fill-black text-black'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Based on {reviewStats.totalReviews} approved review{reviewStats.totalReviews === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              {!currentUserQuery.data ? (
                <div className="mt-8 rounded-2xl bg-gray-50 p-5 text-sm text-gray-600">
                  Sign in to leave a review after purchasing this product.
                </div>
              ) : viewerReview ? (
                <div className="mt-8 rounded-2xl bg-gray-50 p-5">
                  <p className="text-sm font-semibold text-[#121212]">
                    Your review status: {viewerReview.status}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    {viewerReview.status === 'pending'
                      ? 'Your review has been submitted and is waiting for admin approval.'
                      : viewerReview.status === 'approved'
                        ? 'Your review is live on this product.'
                        : viewerReview.moderationNote || 'Your review was rejected by an admin.'}
                  </p>
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-bold tracking-wider text-gray-500">YOUR RATING</p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setReviewRating(value)}
                          className="transition"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              value <= reviewRating
                                ? 'fill-black text-black'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(event) => setReviewTitle(event.target.value)}
                    placeholder="Review title"
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                  />
                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder="Share your experience with this piece"
                    rows={5}
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                  />
                  <p className="text-xs text-gray-500">
                    Reviews are limited to customers who purchased this product and are published after moderation.
                  </p>
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={createReviewMutation.isPending}
                    className="rounded-full bg-black px-6 py-3 text-sm font-bold tracking-wider text-white transition hover:bg-gray-800 disabled:bg-gray-400"
                  >
                    {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Recent Reviews</p>
                  <h3 className="mt-2 text-2xl font-bold text-[#121212]">What customers are saying</h3>
                </div>
              </div>

              {reviewsQuery.isPending ? (
                <div className="mt-6 text-sm text-gray-500">Loading reviews...</div>
              ) : approvedReviews.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-gray-50 p-6 text-sm text-gray-600">
                  No approved reviews yet.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {approvedReviews.map((review) => (
                    <article key={review._id} className="rounded-2xl border border-gray-200 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <Star
                                key={value}
                                className={`h-4 w-4 ${
                                  value <= review.rating
                                    ? 'fill-black text-black'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <h4 className="mt-3 text-lg font-semibold text-[#121212]">
                            {review.title || 'Customer Review'}
                          </h4>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#121212]">{review.userName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {review.verifiedPurchase ? (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                          <BadgeCheck className="h-4 w-4" />
                          Verified Purchase
                        </div>
                      ) : null}
                      <p className="mt-4 text-sm leading-6 text-gray-600">{review.comment}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        <RelatedProducts products={relatedProducts} />
      </main>


    </div>
  );
};

export default ProductItemPage;
