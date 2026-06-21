import CatalogPage from "@/app/_components/catalog-page";

export default function UbicacionPage() {
    return (
        <CatalogPage
            title="Ubicaciones"
            description="Catálogo de ubicaciones físicas para el inventario."
            endpoint="/ubicaciones"
            namePlaceholder="Ej: Mercado"
            descriptionPlaceholder="Dirección, bodega o referencia física"
        />
    );
}
