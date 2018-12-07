/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export {};

declare global {

  /**
   * Specify what this mod will do,
   *
   * 'style': adds css style changes.
   *  entry file type: .css
   *  These are usually safe to add on top of each other.
   *
   * 'theme': adds a theme.
   *  entry file type: .js
   *  Will load the entry js file as a theme.
   *  These should be safe to add on top of each other.
   *
   * 'widget': adds a new widget to the interface that will be wrapped in a standard HUD widget wrapper.
   *  entry file type: .html
   *  These types of mods should be safe to add with others.
   *
   * 'script': A script that is executed that can change anything.
   *  entry file type: .js
   *  This may change the official UI and may conflict with other mods.
   *
   * 'total-conversion': Executes a script, like the 'script' type however, the mod changes so much about
   *  the official UI that it will not be compatible with any other mods that are not built to work with this
   *  total-conversion mod specifically.
   *  entry file type: .js
   */
  type ModType = 'style' | 'theme' | 'widget' | 'script' | 'total-conversion';



  interface ModManifest {
    /**
     * Name of the mod that will be displayed in the Mod Manager. If there are name conflicts with other mods the
     * Addon Manager will append a number like 'Kill Tracker [1]'
     * ex: 'Kill Tracker'
     */
    name: string;

    /**
     * Description of the mod which will be displayed on the Addmon Manager for the user to read about your mod.
     * *optional
     * ex: 'Adds a kill tracker widget that keeps a visible heads up display of your recent kills'
     */
    description?: string;

    /**
     * Version that will be displayed in the Addon Manager listing.
     * ex: '1.0.0'
     */
    version: string | number;

    /**
     * Specifies the type of mod and gives instruction to the game on how to process this mod.
     * see the ModType help for more info on the types.
     * ex: 'widget'
     */
    type: ModType;

    /**
     * Entry file name as path from root of the Mod directory, include your containing folder name.
     * ex: 'kill-tracker/js/main.js'
     */
    entry: string;

    /**
     * If set, then when loading this mod the loader will listen for this event to be triggered before continuing to
     * load any following mods.
     * *optional
     * ex: 'kill-tracker-ready'
     */
    readyEvent?: string;

    /**
     * Array of the names of official interface elements this mod will modify.
     * *optional
     *  possible options: 'chat', 'unit frames', 'skill buttons', 'skill queue', 'warband' ect...
     *  full list tbd
     */
    modifies?: string[];

    /**
     * Homepage / Link to more information about this mod on an external website. Will be displayed in the Addon
     * Manager for the user to be able to visit the page.
     * *optional
     * ex: 'https://veilstorm.io/mods/1234/my-awesome-mod/1.0.0
     */
    homepage?: string;

    /**
     * Author is a single Person object who is to be credited with the development of this mod. If there are multiple
     * contributors, use the contributors property instead.
     */
    author?: {
      name: string;
      email?: string;
      url?: string;
    };

    /**
     * A collection of Person objects who are to be credited with the development of this mod. This will be displayed
     * in the Addon Manager.
     * *optional
     * ex: [{ name: 'JB', email: 'jb@veilstorm.io', url: 'https://veilstorm.io/u/jb'}]
     */
    contributors?: {
      name: string;
      email?: string;
      url?: string;
    }[];
  }
}
