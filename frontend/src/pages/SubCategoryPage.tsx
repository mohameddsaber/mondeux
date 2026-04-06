import CatalogListingPage from "@/components/CatalogListingPage";

interface SubCategoryPageProps {
  subCategorySlug: string;
}

const SubCategoryPage = ({ subCategorySlug }: SubCategoryPageProps) => (
  <CatalogListingPage
    subCategorySlug={subCategorySlug}
    defaultTitle="SUBCATEGORY"
    emptyStateMessage="No products match the current subcategory filters."
    defaultSort="newest"
  />
);

export default SubCategoryPage;
