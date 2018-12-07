/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { LayoutMode } from '../../HUDDrag';

declare global {

  interface EditRange {
    enabled: boolean;
    min: number;
    max: number;
    step: number;
  }

  interface HUDWidget {
    key: string;
    name: string;
    position: Vec2f;
    width: number;
    height: number;
    scale: number;
    opacity: number;
    visible: boolean;
    zOrder: number;

    editor: {
      scale?: EditRange;
      opacity?: EditRange;
      expandX?: EditRange;
      expandY?: EditRange;
      translateX?: EditRange;
      translateY?: EditRange;
    };

    render: (props: { widget: HUDWidget }) => JSX.Element | React.ReactNode;

    // old layout stuff I want to remove
    anchorX?: any;
    anchorY?: any;
    layoutMode: LayoutMode;
  }

}

export function updateWidget(widget: HUDWidget) {

}
