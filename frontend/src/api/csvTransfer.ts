import apiClient from './axios';

export type ImportRow = { line: number; name: string; parent: string | null; status: 'created' | 'exists' | 'invalid'; message?: string };
export type ImportResult = { dryRun: boolean; total: number; created: number; existing: number; invalid: number; results: ImportRow[] };

const save = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const csvTransferApi = {
  downloadCategories: async () => {
    const res = await apiClient.get('/admin/csv/categories/export', { responseType: 'blob' });
    save(res.data as Blob, `danh-muc-${new Date().toISOString().slice(0, 10)}.csv`);
  },
  downloadTemplate: async () => {
    const res = await apiClient.get('/admin/csv/categories/template', { responseType: 'blob' });
    save(res.data as Blob, 'mau-nhap-danh-muc.csv');
  },
  importCategories: async (csv: string, dryRun: boolean): Promise<ImportResult> =>
    (await apiClient.post('/admin/csv/categories/import', { csv, dryRun })).data.data,
};
