import CatalogListingPage from "@/components/CatalogListingPage";

const ProductsPage = () => (
  <CatalogListingPage
    defaultTitle="SHOP ALL"
    emptyStateMessage="No products match the current search and filters."
    defaultSort="popular"
  />
);

export default ProductsPage;
