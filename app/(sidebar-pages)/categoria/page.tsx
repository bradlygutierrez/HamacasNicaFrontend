import { translateText } from "@/app/_lib/localization";
import CatalogPage from "@/app/_components/catalog-page";

export default function CategoriaPage() {
    return (
        <CatalogPage
            title={translateText("Categorías")}
            description="Catálogo de categorías base para el inventario."
            endpoint="/categorias"
            namePlaceholder={translateText("Ej: Familiar")}
            descriptionPlaceholder={translateText("Uso, material o agrupación principal")}
        />
    );
}
