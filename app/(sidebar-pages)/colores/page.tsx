import { translateText } from "@/app/_lib/localization";
import CatalogPage from "@/app/_components/catalog-page";

export default function ColoresPage() {
    return (
        <CatalogPage
            title={translateText("Colores")}
            description="Catálogo de colores usados en la composición de las hamacas."
            endpoint="/colores"
            supportsDescription={false}
            namePlaceholder={translateText("Ej: Azul")}
        />
    );
}
