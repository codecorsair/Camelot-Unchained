/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { InventoryItemFragment, EquippedItemFragment, GearSlotDefRefFragment } from '../../../gqlInterfaces';

/*
  These are the events used throughout the Character widget. We use these to have a more responsive UI because
  there is a lot of data that goes into items which slows down certain actions. These events can get confusing
  but it was necessary to make the widget feel reactive.

  onEquipItem: Called when user equips item.
    fire: ContextMenuContent, ItemsMenuSlot
    listeners: EquippedItemSlot, ItemsMenu

  onUnequipItem: Called when user unequips item.
    fire: EquippedItemSlot
    listeners: EquippedItemSlot, ItemsMenu

  onDropItem: Called when user drops item.
    fire: ContextMenuContent
    listeners: InventoryItemSlot, ItemsMenu

  onHighlightSlots: Called to add highlights on equipment slots.
    fire: ContextMenuContent, ItemsMenuSlot
    listeners: EquippedItemSlot

  onDehighlightSlots: Called to get rid of highlight on equipment slots.
    fire: ContextMenuContent, ItemsMenuSlot
    listeners: EquippedItemSlot

  updateInventoryItems: Update ItemSlots state in InventoryBodyComponent.
    fire: EquippedItemSlot
    listeners: InventoryBody
*/

const eventPrefix = 'charactersheet__';
const eventNames = {
  onCloseInventory: `${eventPrefix}onCloseInventory`,
  onEquipItem: `${eventPrefix}onEquipItem`,
  onUnequipItem: `${eventPrefix}onUnequipItem`,
  onDropItem: `${eventPrefix}onDropItem`,
  onHighlightSlots: `${eventPrefix}onHighlightSlots`,
  onDehighlightSlots: `${eventPrefix}onDehighlightSlots`, // Called to get rid of highlight on equipment slots.
  updateInventoryItems: `${eventPrefix}updateInventoryItemOnEquip`, // Update ItemSlot state in InventoryBody component.
  updateCharacterStats: `${eventPrefix}updateCharacterStats`, // Update character stats
};

export interface OnHighlightSlots {
  gearSlots: GearSlotDefRefFragment[];
}

export interface UpdateInventoryItems {
  equippedItem?: EquippedItemFragment[] | EquippedItemFragment;
  inventoryItem?: InventoryItemFragment;
  willEquipTo?: GearSlotDefRefFragment[];
  type: 'Equip' | 'Unequip' | 'Drop';
}

export interface EquipItemCallback {
  inventoryItem: InventoryItemFragment;
  willEquipTo: GearSlotDefRefFragment[];
  prevEquippedItem?: EquippedItemFragment;
}

export interface UnequipItemCallback {
  item: InventoryItemFragment;
  gearSlots: GearSlotDefRefFragment[];
  dontUpdateInventory?: boolean;
}

export interface DropItemCallback {
  inventoryItem: InventoryItemFragment;
}

export default eventNames;
