/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Chat } from '@csegames/camelot-unchained';
import { LayoutMode, Edge } from '../../../HUDDrag';
import HUDZOrder from '../../../../services/session/HUDZOrder';

export const ChatWidget: HUDWidget = {
  key: 'cse_chat',
  name: 'chat',
  position: {
    x: 0,
    y: 80,
  },
  width: 480,
  height: 240,
  scale: 1,
  opacity: 1,
  visible: true,
  zOrder: HUDZOrder.Chat,
  editor: {},
  render: () => <Chat accessToken={game.accessToken} />,
  layoutMode: LayoutMode.EDGESNAP,
  anchorX: Edge.LEFT,
  anchorY: Edge.BOTTOM,
};
