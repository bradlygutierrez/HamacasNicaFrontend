import CatalogPage from "@/app/_components/catalog-page";

export default function CategoriaPage() {
    return (
        <CatalogPage
            title="Categorías"
            description="Catálogo de categorías base para el inventario."
            endpoint="/categorias"
            namePlaceholder="Ej: Familiar"
            descriptionPlaceholder="Uso, material o agrupación principal"
        />
    );
}
