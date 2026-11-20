import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createDataTexture, updateDataTexture, withTextureOpacity } from '@/renderer/textures';

describe('renderer textures', () => {
  it('creates an sRGB RGBA data texture', () => {
    const data = new Uint8Array([255, 0, 0, 255]);
    const texture = createDataTexture(1, 1, data);
    expect(texture.format).toBe(THREE.RGBAFormat);
    expect(texture.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(texture.image.data).toBe(data);
    texture.dispose();
  });

  it('marks a texture for upload after raster replacement', () => {
    const texture = createDataTexture(1, 1, new Uint8Array(4));
    const version = texture.version;
    const next = new Uint8Array([0, 255, 0, 255]);
    updateDataTexture(texture, next);
    expect(texture.image.data).toBe(next);
    expect(texture.version).toBeGreaterThan(version);
    texture.dispose();
  });

  it('scales alpha without changing the source raster', () => {
    const source = new Uint8Array([10, 20, 30, 200]);
    const result = withTextureOpacity(source, 0.5);
    expect(Array.from(result.slice(0, 3))).toEqual([10, 20, 30]);
    expect(result[3]).toBe(100);
    expect(source[3]).toBe(200);
  });
});
