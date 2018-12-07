/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { ErrorBoundary } from '@csegames/camelot-unchained/lib/components/ErrorBoundary';

import HUDDrag, { HUDDragState } from '../HUDDrag';
import { HUDContext, updateWidget } from './context';

export class HUDWidgets extends React.PureComponent  {
  public render() {
    return (
      <HUDContext.Consumer>
        {(ctx) => {
          const sorted = Object.values(ctx.widgets).sort((a, b) => b.zOrder - a.zOrder);
          const widgets = sorted.map((widget) => {
            return (
              <ErrorBoundary key={widget.key}>
                <HUDDrag
                  name={widget.name}
                  defaultHeight={widget.height}
                  defaultWidth={widget.width}
                  defaultScale={widget.scale}
                  defaultX={widget.position.x}
                  defaultY={widget.position.y}
                  defaultXAnchor={widget.anchorX}
                  defaultYAnchor={widget.anchorY}
                  defaultOpacity={widget.opacity}
                  defaultMode={widget.layoutMode}
                  defaultVisible={widget.visible}
                  zOrder={widget.zOrder}
                  gridDivisions={10}
                  locked={!ctx.hudEditor.active}
                  selected={ctx.hudEditor.active && ctx.hudEditor.selectedWidgetKey === widget.key}
                  save={(s: HUDDragState) => {
                    updateWidget({
                      ...widget,
                      position: {
                        x: s.x,
                        y: s.y,
                      },
                      width: s.width,
                      height: s.height,
                      scale: s.scale,
                      opacity: s.opacity,
                      visible: s.visible,
                    });
                  }}
                  render={() => {
                    if (!ctx.hudEditor.active && !widget.visible) return null;
                    return widget.render({
                      ...widget.props,
                      widget,
                    });
                  }}
                  {...widget}
                />
              </ErrorBoundary>
            );
          });
          return { widgets };
        }}
      </HUDContext.Consumer>
    );
  }
}
