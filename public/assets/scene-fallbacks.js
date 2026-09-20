import { r as React } from './runtime/components-BdJai906.js';
import { an as TextureLoader } from './runtime/Background-CGKUhMwd.js';
export function AuthoredFallbackTexture({ url, onTextureLoaded }) {
  const callback = React.useRef(onTextureLoaded);
  callback.current = onTextureLoaded;
  React.useEffect(() => {
    let cancelled = false;
    new TextureLoader().load(url, texture => { if (cancelled) texture.dispose(); else { texture.flipY = false; callback.current(texture); } });
    return () => { cancelled = true; };
  }, [url]);
  return null;
}
