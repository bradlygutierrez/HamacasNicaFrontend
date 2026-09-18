import ManagedCatalogPage from '@/app/_components/managed-catalog-page';

const fields = [
  { key: 'codigo', label: 'Código', placeholder: 'Ej: ENVIO' },
  { key: 'nombre', label: 'Nombre', placeholder: 'Ej: Envío', required: true },
  { key: 'descripcion', label: 'Descripción', placeholder: 'Descripción opcional' },
  {
    key: 'alcance',
    label: 'Alcance',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'producto', label: 'Producto' },
      { value: 'pedido', label: 'Pedido' },
    ],
  },
  {
    key: 'metodo_calculo',
    label: 'Método de cálculo',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'fijo', label: 'Fijo' },
      { value: 'por_producto', label: 'Por producto' },
      { value: 'por_unidad', label: 'Por unidad' },
      { value: 'por_caracter', label: 'Por carácter' },
      { value: 'manual', label: 'Manual' },
    ],
  },
  { key: 'unidad', label: 'Unidad', placeholder: 'Ej: unidad' },
  { key: 'precio_venta_actual', label: 'Precio de venta', type: 'number' as const, step: '0.01', placeholder: 'Ej: 250', required: true },
  { key: 'costo_actual', label: 'Costo actual', type: 'number' as const, step: '0.01', placeholder: 'Ej: 180', required: true },
];

export default function ServiciosAdicionalesPage() {
  return (
    <ManagedCatalogPage
      title="Servicios adicionales"
      description="Administra servicios complementarios para productos y pedidos futuros."
      endpoint="/servicios-adicionales"
      fields={fields}
      summaryFields={['alcance', 'metodo_calculo', 'precio_venta_actual', 'costo_actual']}
    />
  );
}
