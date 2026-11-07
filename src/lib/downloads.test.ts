import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { downloadsFromAssets } from './downloads.ts';
import type { Asset } from './types.ts';

const torilAssets: Asset[] = JSON.parse(
  readFileSync(new URL('./__fixtures__/graphql-ok.json', import.meta.url), 'utf8'),
).data.r0.latestRelease.releaseAssets.nodes.map((a: { name: string; downloadUrl: string }) => ({
  name: a.name,
  url: a.downloadUrl,
}));

const named = (...names: string[]): Asset[] => names.map((name) => ({ name, url: `https://x/${name}` }));

test('downloadsFromAssets: Toril v1.1.1 → seven installers in platform order', () => {
  const d = downloadsFromAssets(torilAssets);
  assert.deepEqual(
    d.map((x) => x.label),
    [
      'Windows installer',
      'Windows (MSI)',
      'macOS (Apple Silicon)',
      'macOS (Intel)',
      'Linux (AppImage)',
      'Linux (.deb)',
      'Linux (.rpm)',
    ],
  );
  assert.deepEqual(
    d.map((x) => x.primary),
    [true, false, true, true, true, false, false],
  );
  assert.ok(d[0].url.endsWith('Toril_1.1.1_x64-setup.exe'));
});

test('downloadsFromAssets: Tenajlo v1.2.0 → .deb is primary when there is no AppImage', () => {
  const d = downloadsFromAssets(
    named(
      'latest.json',
      'Tenajlo_1.2.0_aarch64.app.tar.gz',
      'Tenajlo_1.2.0_aarch64.app.tar.gz.sig',
      'Tenajlo_1.2.0_aarch64.dmg',
      'Tenajlo_1.2.0_amd64.deb',
      'Tenajlo_1.2.0_amd64.deb.sig',
      'Tenajlo_1.2.0_x64-setup.exe',
      'Tenajlo_1.2.0_x64-setup.exe.sig',
      'THIRD_PARTY_LICENSES.html',
    ),
  );
  assert.deepEqual(
    d.map((x) => [x.label, x.primary]),
    [
      ['Windows installer', true],
      ['macOS (Apple Silicon)', true],
      ['Linux (.deb)', true],
    ],
  );
});

test('downloadsFromAssets: MSI is primary when there is no setup.exe', () => {
  const d = downloadsFromAssets(named('App_x64_en-US.msi'));
  assert.deepEqual(d, [{ platform: 'windows', label: 'Windows (MSI)', url: 'https://x/App_x64_en-US.msi', primary: true }]);
});

test('downloadsFromAssets: nothing installable → no downloads (Review Focus 1)', () => {
  assert.deepEqual(downloadsFromAssets(named('latest.json', 'x.sig', 'App_x64.app.tar.gz', 'NOTES.html')), []);
});

test('downloadsFromAssets: suffix matching is case-insensitive', () => {
  assert.equal(downloadsFromAssets(named('APP_X64-SETUP.EXE'))[0]?.label, 'Windows installer');
});
