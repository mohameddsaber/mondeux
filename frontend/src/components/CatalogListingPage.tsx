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
import { FadeIn } from "@/components/ui/FadeIn";

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
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-[1600px] mx-auto pb-24">
        <FadeIn yOffset={30}>
          <div className="mb-12 px-8 pb-4 pt-16 md:pt-24 text-center">
            <h2 className="mb-6 font-serif text-4xl md:text-5xl tracking-widest text-foreground">
              {resolvedTitle}
            </h2>
            <p className="text-sm font-sans tracking-[0.1em] text-muted-foreground max-w-2xl mx-auto">
              Browse refined essentials with live filters for material, availability,
              price, and sort order.
            </p>
          </div>
        </FadeIn>

        <div className="mx-8 border-b border-border pb-6 mb-12">
          <div className="hidden items-center justify-between gap-6 md:flex">
            <div className="flex flex-wrap items-center gap-4">
              {categoryOptions.length > 0 ? (
                <select
                  value={urlState.selectedCategory}
                  onChange={(event) =>
                    updateSearchParams({
                      category: event.target.value,
                      subCategory: "",
                    })
                  }
                  className="bg-transparent rounded-none border-b border-border px-0 py-2 text-xs font-sans tracking-widest text-foreground outline-none focus:border-ring transition-colors"
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
                  className="bg-transparent rounded-none border-b border-border px-0 py-2 text-xs font-sans tracking-widest text-foreground outline-none focus:border-ring transition-colors"
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
                <div className="flex flex-wrap items-center gap-3">
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
                        className={`px-4 py-2 text-xs font-sans tracking-widest transition-all duration-300 ${selected
                            ? "border border-foreground bg-foreground text-background"
                            : "border border-border text-muted-foreground hover:border-ring hover:text-foreground"
                          }`}
                      >
                        {option.label.toUpperCase()} ({option.count})
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {availabilityOptions.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3">
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
                        className={`px-4 py-2 text-xs font-sans tracking-widest transition-all duration-300 ${selected
                            ? "border border-foreground bg-foreground text-background"
                            : "border border-border text-muted-foreground hover:border-ring hover:text-foreground"
                          }`}
                      >
                        {option.label.toUpperCase()} ({option.count})
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-6">
              <input
                type="number"
                min="0"
                placeholder="MIN"
                value={urlState.minPrice}
                onChange={(event) =>
                  updateSearchParams({ minPrice: event.target.value })
                }
                className="w-20 bg-transparent rounded-none border-b border-border px-0 py-2 text-xs font-sans tracking-widest text-foreground outline-none focus:border-ring transition-colors"
              />
              <input
                type="number"
                min="0"
                placeholder={maxAvailablePrice ? `MAX ${maxAvailablePrice}` : "MAX"}
                value={urlState.maxPrice}
                onChange={(event) =>
                  updateSearchParams({ maxPrice: event.target.value })
                }
                className="w-20 bg-transparent rounded-none border-b border-border px-0 py-2 text-xs font-sans tracking-widest text-foreground outline-none focus:border-ring transition-colors"
              />
              <select
                value={urlState.sortBy}
                onChange={(event) =>
                  updateSearchParams({ sort: event.target.value })
                }
                className="appearance-none bg-transparent rounded-none border-b border-border px-0 py-2 text-xs font-sans tracking-widest text-foreground outline-none focus:border-ring transition-colors cursor-pointer"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label.toUpperCase()}
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
                className="text-xs font-sans tracking-[0.2em] text-muted-foreground hover:text-foreground border-b border-transparent hover:border-foreground transition-colors pb-1"
              >
                CLEAR
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between md:hidden">
            <button
              onClick={() => setFilterOpen(true)}
              className="text-xs font-sans font-medium tracking-widest uppercase hover:text-ring transition-colors"
            >
              FILTER
            </button>
            <div className="flex items-center gap-2 text-xs font-sans tracking-widest text-muted-foreground">
              <span>{totalResults} RESULTS</span>
              <Plus size={14} />
            </div>
          </div>

          <div className="mt-6 hidden md:flex items-center justify-between text-xs font-sans tracking-[0.2em] text-muted-foreground">
            <span>{totalResults} MATCHING PIECES</span>
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
          <div className="grid grid-cols-2 gap-x-0.5 gap-y-6 px-1 md:grid-cols-4 md:gap-x-1 md:gap-y-8 md:px-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <FadeIn key={index} delay={0.2}>
                <div className="flex flex-col space-y-4 overflow-hidden animate-pulse">
                  <div className="aspect-[4/5] w-full bg-secondary"></div>
                  <div className="space-y-3 px-2 flex flex-col items-center">
                    <div className="h-5 w-3/4 bg-secondary"></div>
                    <div className="h-4 w-1/3 bg-secondary"></div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-destructive font-sans">
            Error fetching products: {error}
          </div>
        ) : products.length === 0 ? (
          <div className="mx-auto max-w-xl px-6 py-24 text-center">
            <h3 className="mb-4 text-xl font-serif text-foreground tracking-widest">
              {emptyStateMessage}
            </h3>
            <p className="mb-8 text-sm font-sans tracking-wide text-muted-foreground">
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
              className="border border-foreground bg-foreground px-8 py-3 text-xs font-sans tracking-[0.2em] text-background hover:bg-transparent hover:text-foreground transition-colors duration-500"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-0.5 gap-y-6 px-1 md:grid-cols-4 md:gap-x-1 md:gap-y-8 md:px-2">
            {products.map((product, idx) => (
              <FadeIn key={product._id} delay={0.2}>
                <Link to={`/products/${product.slug}`}>
                  <ProductCard product={product} index={idx} />
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default CatalogListingPage;
