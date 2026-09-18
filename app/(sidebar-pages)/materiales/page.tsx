import ManagedCatalogPage from '@/app/_components/managed-catalog-page';

const fields = [
  { key: 'codigo', label: 'Código', placeholder: 'Ej: MANILA-001' },
  { key: 'nombre', label: 'Nombre', placeholder: 'Ej: Manila', required: true },
  { key: 'descripcion', label: 'Descripción', placeholder: 'Descripción opcional' },
  { key: 'unidad_consumo', label: 'Unidad de consumo', placeholder: 'Ej: metro', required: true },
  { key: 'unidad_compra', label: 'Unidad de compra', placeholder: 'Ej: rollo', required: true },
  { key: 'contenido_por_compra', label: 'Contenido por compra', type: 'number' as const, step: '0.0001', placeholder: 'Ej: 100' },
  { key: 'precio_actual', label: 'Precio actual', type: 'number' as const, step: '0.01', placeholder: 'Ej: 600', required: true },
  { key: 'porcentaje_merma', label: 'Merma (%)', type: 'number' as const, step: '0.01', placeholder: 'Ej: 2.5' },
];

export default function MaterialesPage() {
  return (
    <ManagedCatalogPage
      title="Materiales"
      description="Administra materiales, unidades de compra, consumo, precios y merma para futuras recetas de producción."
      endpoint="/materiales"
      screenPath="/materiales"
      fields={fields}
      summaryFields={['precio_actual', 'unidad_consumo', 'unidad_compra', 'contenido_por_compra', 'porcentaje_merma']}
    />
  );
}
