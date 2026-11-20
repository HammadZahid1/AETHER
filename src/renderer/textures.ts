import * as THREE from 'three';

/** Create an RGBA data texture for a simulation raster. */
export function createDataTexture(width: number, height: number, data: Uint8Array): THREE.DataTexture {
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/** Replace the source of an existing raster texture after a simulation update. */
export function updateDataTexture(texture: THREE.DataTexture, data: Uint8Array): void {
  texture.image.data = data;
  texture.needsUpdate = true;
}

/** Scale the alpha channel of a raster without mutating the source buffer. */
export function withTextureOpacity(data: Uint8Array, opacity: number): Uint8Array {
  const scaled = new Uint8Array(data.length);
  const factor = Math.min(1, Math.max(0, opacity));
  for (let index = 3; index < data.length; index += 4) {
    scaled[index - 3] = data[index - 3];
    scaled[index - 2] = data[index - 2];
    scaled[index - 1] = data[index - 1];
    scaled[index] = Math.round(data[index] * factor);
  }
  return scaled;
}
