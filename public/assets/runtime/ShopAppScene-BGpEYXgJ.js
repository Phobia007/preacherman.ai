import { r as React } from './components-BdJai906.js';
import { a as loading } from './Background-CGKUhMwd.js';
import { a as scenes, b as loadingUI } from './(_locale).editions.winter2026-DhFtUF58.js';
export function ShopAppScene({sectionIndex}) {
  React.useEffect(() => {
    const token = 'continuity-shared-cast';
    let ready = false;
    loading.getState().startLoading(sectionIndex, token);
    function syncReady() {
      const sourceIndex = [...scenes.getState().sectionMap].find(([, scene]) => scene.name === 'operations')?.[0];
      if (sourceIndex === undefined || !loading.getState().isSceneLoaded(sourceIndex)) return;
      if (!ready) {
        ready = true;
        loading.getState().finishLoading(sectionIndex, token);
      }
      if (scenes.getState().activeSection === sectionIndex && loading.getState().isSceneLoaded(sectionIndex)) {
        loadingUI.getState().setIsLoaded(true);
      }
    }
    const stopLoading = loading.subscribe(syncReady);
    const stopScene = scenes.subscribe(state => state.activeSection, syncReady);
    syncReady();
    return () => {
      stopLoading(); stopScene();
      if (!ready) loading.getState().finishLoading(sectionIndex, token);
    };
  }, [sectionIndex]);
  return null;
}
