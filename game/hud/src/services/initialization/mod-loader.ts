/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export function initializeModLoader() {
  game.onLoadMods(loadMods);
}

async function loadMods(manifestsJSON: string) {
  if (_devGame._did_load_mods) {
    return;
  }
  _devGame._did_load_mods = true;

  const manifests = JSON.tryParse<ModManifest[]>(manifestsJSON);
  if (!manifests) {
    console.warn('loadMods failed to parse manifests');
    return;
  }

  for (let index = 0; index < manifests.length; ++index) {
    engine.trigger('mod-loader_load-start', index);
    const result = await loadMod(manifests[index]);
    engine.trigger('mod-loader_load-complete', index, result);
  }
}

function loadMod(manifest: ModManifest) {
  switch (manifest.type) {
    case 'style': return loadStyle(manifest);
    case 'theme': return loadTheme(manifest);
    case 'widget': return loadWidget(manifest);
    case 'script': return loadScript(manifest);
    case 'total-conversion': return loadScript(manifest);
  }
  console.warn(`Attempted to load a mod with an invalid type. type: ${manifest.type} | name: ${manifest.name}`);
}

function tryFetchEntry(manifest: ModManifest, onSuccess: (response: Response) => Promise<boolean>) {
  return fetch('coui://' + manifest.entry)
    .then(async (response) => {
      if (!response.ok) {
        // tslint:disable-next-line:max-line-length
        console.warn(`Failed to load ${manifest.type} mod ${manifest.name} with status ${response.status} | ${response.statusText}`);
        return false;
      }
      return await onSuccess(response);
    })
    .catch((reason) => {
      console.warn(`Failed to load style mod ${manifest.name} with reason ${JSON.stringify(reason)}`);
      return false;
    });
}

function loadStyle(manifest: ModManifest) {
  return tryFetchEntry(manifest, async (response) => {
    try {
      const css = await response.text();
      const style = '<style>' + css + '</style>';
      document.getElementById('style-mods').insertAdjacentHTML('beforeend', style);
      return true;
    } catch {
      return false;
    }
  });
}

function loadTheme(manifest: ModManifest) {
  return tryFetchEntry(manifest, async (response) => {
    try {
      const theme = await response.text();
      game.trigger('mod-loader_load-theme', manifest, theme);
      return true;
    } catch {
      return false;
    }
  });
}

function loadScript(manifest: ModManifest) {
  return tryFetchEntry(manifest, async (response) => {
    try {
      const js = await response.text();

      const readyPromise = new Promise((resolve) => {
        if (manifest.readyEvent) {
          game.once(manifest.readyEvent, () => resolve());
        } else {
          resolve();
        }
      });

      // tslint:disable-next-line:no-eval
      eval(js);

      await readyPromise;
      return true;
    } catch {
      return false;
    }
  });
}

function loadWidget(manifest: ModManifest) {
  return tryFetchEntry(manifest, async (response) => {
    try {
      const html = await response.text();

      const readyPromise = new Promise((resolve) => {
        if (manifest.readyEvent) {
          game.once(manifest.readyEvent, () => resolve());
        } else {
          resolve();
        }
      });

      game.trigger('mod-loader_load-widget', manifest, html);
      await readyPromise;
      return true;
    } catch {
      return false;
    }
  });
}
