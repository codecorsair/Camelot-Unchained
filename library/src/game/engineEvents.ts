/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Mapping of Engine Event name => GameInterface callback registration method name for creating
 * event forwarding methods on the GameInterface upon initialization
 */
const regMap: {[key: string]: string} = {};

/**
 * Begin chat is fired by the game client to tell the UI that the user wishes to begin sending a chat message.
 *
 * Expected behavior: The chat input element will gain focus and accept text input.
 *
 * @param {String} message Optional: A message to auto-populate into the chat input.
 */
export const EE_BeginChat = 'beginChat';
regMap[EE_BeginChat] = 'onBeginChat';

/**
 * The client wishes to display a message in the system log.
 *
 * Expected behavior: the provided message id displayed in the system log.
 *
 * @param {String} message The text to display in the system log
 */
export const EE_SystemMessage = 'systemMessage';
regMap[EE_SystemMessage] = 'onSystemMessage';

/**
 * A scenario round that the current player is in has ended.
 *
 * Expected behavior: Displays a notificaiton of win/loss for the round and if the
 * scenario has ended, displays the scoreboard
 *
 * @param {String} scenarioID An identifer for the scenario
 * @param {String} roundID An identifer for a scenario round
 * @param {Boolean} didEnd Whether the scenario ended, this was the last round
 * @param {Boolean} didWin Whether the player's team has won the scenario
 */
export const EE_ScenarioRoundEnd = 'scenarioRoundEnd';
regMap[EE_ScenarioRoundEnd] = 'onScenarioRoundEnded';

/**
 * Notify the UI of one or more combat log events
 *
 * Expected behavior: Display combat events information in the UI combat log
 *
 * @param {CombatEvent[]} events An array of Combat events to display in the log
 */
export const EE_CombatEvent = 'combatEvent';
regMap[EE_CombatEvent] = 'onCombatEvent';

/**
 * Send a string to be displayed in the UI's console interface
 *
 * Expected behavior: Display the provided text in the console
 *
 * @param {String} text Text to be displayed in the console
 */
export const EE_ConsoleText = 'consoleText';
regMap[EE_ConsoleText] = 'onConsoleText';

/**
 * A new / updated DevUI is provided by the client
 *
 * Expected behavior: Displays or hides a DevUI based on the given update information
 *
 * @param {String} id Identifer to uniquely ID a specific DevUI
 * @param {String} rootPage JSON string of a DevUI RootPage.
 */
export const EE_OnUpdateDevUI = 'updateDevUI';
regMap[EE_OnUpdateDevUI] = 'onUpdateDevUI';

/**
 * Announcement message sent from the game client
 *
 * Expected behavior: Displays announcement text on screen
 *
 * @param {String} message Text contents of the announcement to display
 */
export const EE_OnAnnouncement = 'announcement';
regMap[EE_OnAnnouncement] = 'onAnnouncement';

/**
 * Client requests UI navigation for a specific target.
 *
 * Expected behavior: UI toggles element requested by the navigation trigger.
 * eg. navigation request is to 'inventory.open', the UI will open the inventory if it is not open.
 *
 * @param {String} target Navigation target
 */
export const EE_OnNavigate = 'navigate';
regMap[EE_OnNavigate] = 'onNavigate';

/**
 * Called when a keybind is changed.
 *
 * @param {Keybind} keybind The Keybind that changed
 */
export const EE_OnKeybindChanged = 'keybindChanged';
regMap[EE_OnKeybindChanged] = 'onKeybindChanged';

/**
 * Called when an option is changed.
 *
 * @param {GameOption} option The changed option
 */
export const EE_OnOptionChanged = 'optionChanged';
regMap[EE_OnOptionChanged] = 'onOptionChanged';

/**
 * Called when the BuildingMode is changed.
 *
 * @param {BuildingMode} mode The new mode
 */
export const EE_OnBuildingModeChanged = 'buildingModeChanged';
regMap[EE_OnBuildingModeChanged] = 'onBuildingModeChanged';

/**
 * Called when the active plot is changed.
 *
 * @param {String} plotID The new plot id
 * @param {Boolean} canEdit Whether the player can edit the active plot
 */
export const EE_OnActivePlotChanged = 'activePlotChanged';
regMap[EE_OnActivePlotChanged] = 'onActivePlotChanged';

/**
 * Called when the selected block is changed.
 *
 * @param {Number} blockID The new block id
 */
export const EE_OnSelectedBlockChanged = 'selectedBlockChanged';
regMap[EE_OnSelectedBlockChanged] = 'onSelectedBlockChanged';

/**
 * Called when the selected material is changed.
 *
 * @param {Number} id The new material id
 */
export const EE_OnSelectedMaterialChanged = 'selectedMaterialChanged';
regMap[EE_OnSelectedMaterialChanged] = 'onSelectedMaterialChanged';

/**
 * Called when the selected blueprint is changed.
 *
 * @param {Number} id The new blueprint id
 */
export const EE_OnSelectedBlueprintChanged = 'selectedBlueprintChanged';
regMap[EE_OnSelectedBlueprintChanged] = 'onSelectedBlueprintChanged';

/**
 * Called when the client keybind for "Toggle Build Selection Interface" is registered.
 */
export const EE_OnToggleBuildSelector = 'toggleBuildSelector';
regMap[EE_OnToggleBuildSelector] = 'onToggleBuildSelector';

/**
 * Called when the client keybind for "Create Blueprint From Selection" is registered.
 */
export const EE_OnWantCreateBlueprintFromSelection = 'wantCreateBlueprintFromSelection';
regMap[EE_OnWantCreateBlueprintFromSelection] = 'onWantCreateBlueprintFromSelection';


/**
 * PerfHUD - Works on Protected HUD only
 */
export const EE_OnPerfHUDUpdate = 'perfhud.update';
regMap[EE_OnPerfHUDUpdate] = 'onPerfHUDUpdate';

/**
 * Called to load mods.
 *
 * @param {string} manifests A JSON string containing an array of mod manifests provided in the order in which they
 * should be loaded.
 */
export const EE_OnLoadMods = 'loadMods';
regMap[EE_OnLoadMods] = 'onLoadMods';

/**
 * Initialize engine event forwarding
 */
export default function() {
  for (const key in regMap) {
    createForwardingMethod(key, regMap[key]);
    engine.on(key, (...args: any[]) => game.trigger(key, ...args));
  }
}

function createForwardingMethod(engineEvent: string, methodName: string) {
  _devGame[methodName] = function(callback: (...args: any[]) => any): EventHandle {
    return window._cse_dev_eventEmitter.addListener(engineEvent, false, callback);
  };
}
