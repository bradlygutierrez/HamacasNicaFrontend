"use client";

import ProformaEditor from "@/app/_components/proforma-editor";
import PedidoConversionAction from "@/app/_components/pedido-conversion-action";
import PdfActions from "@/app/_components/pdf-actions";
import { useParams } from "next/navigation";
export default function ExistingProformaPage() { const { id } = useParams<{ id: string }>(); return <><div className="flex flex-wrap items-center gap-2 px-3 pt-3 sm:px-8"><PedidoConversionAction /><PdfActions endpoint={`/proformas/${id}/pdf`} /></div><ProformaEditor /></>; }
