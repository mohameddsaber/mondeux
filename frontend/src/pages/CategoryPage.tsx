import CatalogListingPage from "@/components/CatalogListingPage";

interface CategoryPageProps {
  categorySlug: string;
}

const CategoryPage = ({ categorySlug }: CategoryPageProps) => (
  <CatalogListingPage
    categorySlug={categorySlug}
    defaultTitle="CATEGORY"
    emptyStateMessage="No products match the current category filters."
    defaultSort="newest"
  />
);

export default CategoryPage;
