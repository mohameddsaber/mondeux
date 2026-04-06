import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import ProductCard, { type Product } from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import { getApiErrorMessage } from "@/lib/api";
import { trackClientEvent } from "@/lib/analytics";
import {
  useCatalogProductsQuery,
  type CatalogFacetOption,
} from "@/hooks/useStoreData";

type CatalogListingPageProps = {
  categorySlug?: string;
  subCategorySlug?: string;
  defaultTitle: string;
  emptyStateMessage: string;
  defaultSort?: string;
};

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Best Selling" },
];

const splitParam = (value: string | null) =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toggleArrayValue = (values: string[], nextValue: string) =>
  values.includes(nextValue)
    ? values.filter((value) => value !== nextValue)
    : [...values, nextValue];

const buildTitleFromSlug = (value = "") =>
  value ? value.replace(/-/g, " ").toUpperCase() : "";

function CatalogListingPage({
  categorySlug = "",
  subCategorySlug = "",
  defaultTitle,
  emptyStateMessage,
  defaultSort = "newest",
}: CatalogListingPageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const trackedSearchKeyRef = useRef("");
  const [filterOpen, setFilterOpen] = useState(false);

  const urlState = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("q") || "";
    const sortBy = params.get("sort") || (searchQuery ? "relevance" : defaultSort);

    return {
      searchQuery,
      sortBy,
      selectedCategory: params.get("category") || "",
      selectedSubCategory: params.get("subCategory") || "",
      selectedMaterials: splitParam(params.get("material")),
      selectedAvailability: splitParam(params.get("availability")),
      minPrice: params.get("minPrice") || "",
      maxPrice: params.get("maxPrice") || "",
      title:
        params.get("title")
        || (searchQuery
          ? `SEARCH RESULTS FOR "${searchQuery.toUpperCase()}"`
          : defaultTitle),
    };
  }, [defaultSort, defaultTitle, location.search]);

  const productsQuery = useCatalogProductsQuery({
    categorySlug,
    subCategorySlug,
    searchQuery: urlState.searchQuery,
    sortBy: urlState.sortBy,
    selectedCategory: urlState.selectedCategory,
    selectedSubCategory: urlState.selectedSubCategory,
    selectedMaterials: urlState.selectedMaterials,
    selectedAvailability: urlState.selectedAvailability,
    minPrice: urlState.minPrice,
    maxPrice: urlState.maxPrice,
  });

  const products: Product[] = productsQuery.data?.data || [];
  const loading = productsQuery.isPending;
  const error = productsQuery.error
    ? getApiErrorMessage(productsQuery.error, "Failed to fetch products")
    : null;
  const facets = productsQuery.data?.facets;
  const pagination = productsQuery.data?.pagination;
  const totalResults = pagination?.total || products.length;
  const categoryTitle =
    productsQuery.data?.category?.name?.toUpperCase()
    || buildTitleFromSlug(categorySlug);
  const subCategoryTitle =
    productsQuery.data?.subCategory?.name?.toUpperCase()
    || buildTitleFromSlug(subCategorySlug);
  const resolvedTitle = subCategorySlug
    ? `SHOP ${subCategoryTitle || defaultTitle}`
    : categorySlug
      ? `SHOP ${categoryTitle || defaultTitle}`
      : urlState.title;

  const updateSearchParams = (updates: Record<string, string | string[] | null>) => {
    const params = new URLSearchParams(location.search);

    Object.entries(updates).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          params.delete(key);
        } else {
          params.set(key, value.join(","));
        }
        return;
      }

      if (value === null || value === "") {
        params.delete(key);
        return;
      }

      params.set(key, value);
    });

    navigate(
      {
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : "",
      },
      { replace: false }
    );
  };

  const categoryOptions = categorySlug ? [] : facets?.categories || [];
  const subCategoryOptions: CatalogFacetOption[] = facets?.subCategories || [];
  const materialOptions: CatalogFacetOption[] = facets?.materials || [];
  const availabilityOptions: CatalogFacetOption[] = facets?.availability || [];
  const maxAvailablePrice = Math.ceil(facets?.priceRange?.max || 0);

  useEffect(() => {
    if (!urlState.searchQuery || loading || error) {
      return;
    }

    const trackingKey = [
      urlState.searchQuery,
      urlState.sortBy,
      categorySlug,
      subCategorySlug,
      urlState.selectedCategory,
      urlState.selectedSubCategory,
      urlState.selectedMaterials.join(","),
      urlState.selectedAvailability.join(","),
      urlState.minPrice,
      urlState.maxPrice,
      totalResults,
    ].join("|");

    if (trackedSearchKeyRef.current === trackingKey) {
      return;
    }

    trackedSearchKeyRef.current = trackingKey;

    trackClientEvent({
      eventType: "search",
      metadata: {
        query: urlState.searchQuery,
        resultCount: totalResults,
        zeroResults: totalResults === 0,
        sortBy: urlState.sortBy,
        categorySlug: categorySlug || urlState.selectedCategory,
        subCategorySlug: subCategorySlug || urlState.selectedSubCategory,
        materials: urlState.selectedMaterials,
        availability: urlState.selectedAvailability,
        minPrice: urlState.minPrice || null,
        maxPrice: urlState.maxPrice || null,
      },
    });
  }, [
    categorySlug,
    error,
    loading,
    subCategorySlug,
    totalResults,
    urlState.maxPrice,
    urlState.minPrice,
    urlState.searchQuery,
    urlState.selectedAvailability,
    urlState.selectedCategory,
    urlState.selectedMaterials,
    urlState.selectedSubCategory,
    urlState.sortBy,
  ]);

  return (
    <div className="min-h-screen bg-white">
      <main>
        <div className="mb-6 px-[60px] pb-[15px] pt-[37.5px] text-center md:px-[80px] md:pb-[20px] md:pt-[50px]">
          <h2 className="mb-3 font-ui text-[22px] text-[#121212] -tracking-tight md:text-[28px]">
            {resolvedTitle}
          </h2>
          <p className="text-[12px] text-gray-600">
            Browse refined essentials with live filters for material, availability,
            price, and sort order.
          </p>
        </div>

        <div className="mx-5 border-b border-gray-200 pb-[10px]">
          <div className="hidden items-center justify-between gap-4 md:flex">
            <div className="flex flex-wrap items-center gap-3">
              {categoryOptions.length > 0 ? (
                <select
                  value={urlState.selectedCategory}
                  onChange={(event) =>
                    updateSearchParams({
                      category: event.target.value,
                      subCategory: "",
                    })
                  }
                  className="rounded border border-gray-200 px-3 py-2 text-[12px] font-[Karla] tracking-widest text-gray-600 outline-none"
                >
                  <option value="">ALL CATEGORIES</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </option>
                  ))}
                </select>
              ) : null}

              {subCategoryOptions.length > 0 ? (
                <select
                  value={urlState.selectedSubCategory}
                  onChange={(event) =>
                    updateSearchParams({ subCategory: event.target.value })
                  }
                  className="rounded border border-gray-200 px-3 py-2 text-[12px] font-[Karla] tracking-widest text-gray-600 outline-none"
                >
                  <option value="">ALL SUBCATEGORIES</option>
                  {subCategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </option>
                  ))}
                </select>
              ) : null}

              {materialOptions.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {materialOptions.map((option) => {
                    const selected = urlState.selectedMaterials.includes(option.value);

                    return (
                      <button
                        key={option.value}
                        onClick={() =>
                          updateSearchParams({
                            material: toggleArrayValue(
                              urlState.selectedMaterials,
                              option.value
                            ),
                          })
                        }
                        className={`rounded-full border px-3 py-2 text-[11px] font-[Karla] tracking-widest transition ${
                          selected
                            ? "border-black bg-black text-white"
                            : "border-gray-200 text-gray-600"
                        }`}
                      >
                        {option.label.toUpperCase()} ({option.count})
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {availabilityOptions.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {availabilityOptions.map((option) => {
                    const selected = urlState.selectedAvailability.includes(option.value);

                    return (
                      <button
                        key={option.value}
                        onClick={() =>
                          updateSearchParams({
                            availability: toggleArrayValue(
                              urlState.selectedAvailability,
                              option.value
                            ),
                          })
                        }
                        className={`rounded-full border px-3 py-2 text-[11px] font-[Karla] tracking-widest transition ${
                          selected
                            ? "border-black bg-black text-white"
                            : "border-gray-200 text-gray-600"
                        }`}
                      >
                        {option.label.toUpperCase()} ({option.count})
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                placeholder="MIN"
                value={urlState.minPrice}
                onChange={(event) =>
                  updateSearchParams({ minPrice: event.target.value })
                }
                className="w-24 rounded border border-gray-200 px-3 py-2 text-[12px] font-[Karla] tracking-widest text-gray-600 outline-none"
              />
              <input
                type="number"
                min="0"
                placeholder={maxAvailablePrice ? `MAX ${maxAvailablePrice}` : "MAX"}
                value={urlState.maxPrice}
                onChange={(event) =>
                  updateSearchParams({ maxPrice: event.target.value })
                }
                className="w-24 rounded border border-gray-200 px-3 py-2 text-[12px] font-[Karla] tracking-widest text-gray-600 outline-none"
              />
              <select
                value={urlState.sortBy}
                onChange={(event) =>
                  updateSearchParams({ sort: event.target.value })
                }
                className="appearance-none rounded border border-gray-200 bg-white px-3 py-2 text-[12px] font-[Karla] tracking-widest text-gray-600 outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  updateSearchParams({
                    category: "",
                    subCategory: "",
                    material: [],
                    availability: [],
                    minPrice: "",
                    maxPrice: "",
                    sort: urlState.searchQuery ? "relevance" : defaultSort,
                  })
                }
                className="text-[12px] font-[Karla] tracking-widest text-gray-500 underline"
              >
                CLEAR
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between md:hidden">
            <button
              onClick={() => setFilterOpen(true)}
              className="mx-[15px] px-[18px] text-sm font-[Karla] font-medium tracking-wide uppercase hover:text-gray-600"
            >
              FILTER
            </button>
            <div className="flex items-center gap-2 text-[12px] font-[Karla] tracking-widest text-gray-500">
              <span>{totalResults} RESULTS</span>
              <Plus size={12} className="text-gray-700" />
            </div>
          </div>

          <div className="mt-4 hidden md:flex items-center justify-between text-[12px] font-[Karla] tracking-widest text-gray-500">
            <span>{totalResults} MATCHING PRODUCTS</span>
            {urlState.searchQuery ? (
              <span>SEARCH: {urlState.searchQuery.toUpperCase()}</span>
            ) : null}
          </div>
        </div>

        <FilterSidebar
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          sortBy={urlState.sortBy}
          sortOptions={SORT_OPTIONS}
          categoryOptions={categoryOptions}
          subCategoryOptions={subCategoryOptions}
          materialOptions={materialOptions}
          availabilityOptions={availabilityOptions}
          selectedCategory={urlState.selectedCategory}
          selectedSubCategory={urlState.selectedSubCategory}
          selectedMaterials={urlState.selectedMaterials}
          selectedAvailability={urlState.selectedAvailability}
          minPrice={urlState.minPrice}
          maxPrice={urlState.maxPrice}
          onSortChange={(value) => updateSearchParams({ sort: value })}
          onCategoryChange={(value) =>
            updateSearchParams({ category: value, subCategory: "" })
          }
          onSubCategoryChange={(value) => updateSearchParams({ subCategory: value })}
          onToggleMaterial={(value) =>
            updateSearchParams({
              material: toggleArrayValue(urlState.selectedMaterials, value),
            })
          }
          onToggleAvailability={(value) =>
            updateSearchParams({
              availability: toggleArrayValue(urlState.selectedAvailability, value),
            })
          }
          onMinPriceChange={(value) => updateSearchParams({ minPrice: value })}
          onMaxPriceChange={(value) => updateSearchParams({ maxPrice: value })}
          onClearAll={() =>
            updateSearchParams({
              category: "",
              subCategory: "",
              material: [],
              availability: [],
              minPrice: "",
              maxPrice: "",
              sort: urlState.searchQuery ? "relevance" : defaultSort,
            })
          }
          onApply={() => setFilterOpen(false)}
        />

        {loading ? (
          <div className="grid grid-cols-2 gap-4 p-[20px] md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex flex-col space-y-3 overflow-hidden rounded-lg animate-pulse">
                <div className="h-64 w-full rounded-lg bg-gray-200"></div>
                <div className="space-y-2 px-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Error fetching products: {error}
          </div>
        ) : products.length === 0 ? (
          <div className="mx-auto max-w-xl px-6 py-16 text-center">
            <h3 className="mb-3 text-lg font-medium text-[#121212]">
              {emptyStateMessage}
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              Try clearing a filter, widening the price range, or searching with
              fewer terms.
            </p>
            <button
              onClick={() =>
                updateSearchParams({
                  q: "",
                  title: "",
                  category: "",
                  subCategory: "",
                  material: [],
                  availability: [],
                  minPrice: "",
                  maxPrice: "",
                  sort: defaultSort,
                })
              }
              className="rounded-full bg-black px-5 py-3 text-[12px] font-[Karla] tracking-widest text-white"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-[20px] md:grid-cols-4">
            {products.map((product) => (
              <Link to={`/products/${product.slug}`} key={product._id}>
                <ProductCard product={product} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default CatalogListingPage;
