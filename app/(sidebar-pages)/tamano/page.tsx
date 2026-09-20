import CatalogPage from "@/app/_components/catalog-page";

export default function TamanoPage() {
    return (
        <CatalogPage
            title="Tamaños"
            description="Catálogo de tamaños de hamaca."
            endpoint="/tamanos"
            namePlaceholder="Ej: Individual"
            descriptionPlaceholder="Descripción o dimensiones del tamaño"
        />
    );
}
