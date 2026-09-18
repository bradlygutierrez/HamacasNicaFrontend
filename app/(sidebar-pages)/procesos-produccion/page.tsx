import ManagedCatalogPage from '@/app/_components/managed-catalog-page';

const fields = [
  { key: 'codigo', label: 'Código', placeholder: 'Ej: TEJ' },
  { key: 'nombre', label: 'Nombre', placeholder: 'Ej: Tejido', required: true },
  { key: 'descripcion', label: 'Descripción', placeholder: 'Descripción opcional' },
];

export default function ProcesosProduccionPage() {
  return (
    <ManagedCatalogPage
      title="Procesos de producción"
      description="Administra los procesos de producción y tipos de mano de obra disponibles."
      endpoint="/procesos-produccion"
      fields={fields}
      summaryFields={['codigo', 'descripcion']}
    />
  );
}
