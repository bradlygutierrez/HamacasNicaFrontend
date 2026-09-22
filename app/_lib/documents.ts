import { apiFetch } from "@/app/_lib/api";

async function pdfResponse(endpoint: string): Promise<Response> {
  const response = await apiFetch(endpoint);
  if (!response.ok) {
    const data = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(data?.message ?? "No se pudo generar el PDF.");
  }
  return response;
}

export async function openPdf(endpoint: string): Promise<void> {
  const blob = await (await pdfResponse(endpoint)).blob();
  const url = URL.createObjectURL(blob);
  const tab = window.open(url, "_blank", "noopener,noreferrer");
  if (!tab) throw new Error("El navegador bloqueó la nueva pestaña del PDF.");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function downloadPdf(endpoint: string, filename?: string): Promise<void> {
  const response = await pdfResponse(endpoint + (endpoint.includes("?") ? "&" : "?") + "download=1");
  const blob = await response.blob();
  const headerName = response.headers.get("Content-Disposition")?.match(/filename="?([^";]+)"?/i)?.[1];
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename ?? headerName ?? "documento.pdf";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
