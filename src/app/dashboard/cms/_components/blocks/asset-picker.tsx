'use client';

import { blockFieldClasses } from './block-field';

/**
 * MOCK asset picker (task A10). The real library picker arrives with task C5
 * (`POST /api/cms/assets` + the Directus media browser); until then the editor
 * picks from a fixed sample list of valid uuids so forms stay valid by default.
 */
export const MOCK_ASSETS = [
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', label: 'Poster acara (mock)' },
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', label: 'Foto kelompok (mock)' },
  { id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', label: 'Dokumentasi (mock)' },
] as const;

export function MockAssetPicker({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (assetId: string) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={blockFieldClasses('h-9 w-full')}
      aria-label='Aset gambar'
    >
      {MOCK_ASSETS.map((asset) => (
        <option key={asset.id} value={asset.id}>
          {asset.label}
        </option>
      ))}
    </select>
  );
}
