import { translateText } from "@/app/_lib/localization";
import CatalogPage from "@/app/_components/catalog-page";

export default function TamanoPage() {
    return (
        <CatalogPage
            title={translateText("Tamaños")}
            description="Catálogo de tamaños de hamaca."
            endpoint="/tamanos"
            namePlaceholder={translateText("Ej: Individual")}
            descriptionPlaceholder={translateText("Descripción o dimensiones del tamaño")}
        />
    );
}
