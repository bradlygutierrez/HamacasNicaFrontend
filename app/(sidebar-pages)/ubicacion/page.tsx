import { translateText } from "@/app/_lib/localization";
import CatalogPage from "@/app/_components/catalog-page";

export default function UbicacionPage() {
    return (
        <CatalogPage
            title={translateText("Ubicaciones")}
            description="Catálogo de ubicaciones físicas para el inventario."
            endpoint="/ubicaciones"
            namePlaceholder={translateText("Ej: Mercado")}
            descriptionPlaceholder={translateText("Dirección, bodega o referencia física")}
        />
    );
}
