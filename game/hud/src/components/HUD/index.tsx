/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { connect } from 'react-redux';
import styled from 'react-emotion';
import { hot } from 'react-hot-loader';

import DragStore from '../DragAndDrop/DragStore';
import {
  LayoutState,
  initialize,
  setVisibility,
  Widget,
} from '../../services/session/layout';
import { InvitesState, initializeInvites } from '../../services/session/invites';
import { SessionState } from '../../services/session/reducer';
import Watermark from '../Watermark';
import { LoadingScreen } from '../LoadingScreen';
import { OfflineZoneSelect } from '../OfflineZoneSelect';
import HUDFullScreen from '../../widgets/HUDFullScreen';
import DevUI from '../DevUI';
import AbilityBar from '../AbilityBar';
import ScenarioPopup from '../ScenarioPopup';
import ScenarioResults from '../ScenarioResults';
import Settings from '../../widgets/Settings/SettingsMain';

import { ZoneName } from '../ZoneName';
import HUDEditor from './HUDEditor';

// TEMP -- Disable this being movable/editable
import HUDNav from '../../services/session/layoutItems/HUDNav';
import Console from '../Console';
import { InteractiveAlertView } from '../InteractiveAlert';
import { ContextMenu } from '../ContextMenu';
import { TooltipView } from 'UI/Tooltip';
import PassiveAlert from '../PassiveAlert';
import { HUDContext, HUDContextState, defaultContextState, fetchSkills, fetchStatuses } from './context';
import { HUDWidgets } from './HUDWidgets';

const HUDNavContainer = styled('div')`
  position: fixed;
  top: 0;
  left: 0;
  width: 900px;
  height: 200px;
  pointer-events: none;
  z-index: 999;
`;

const ZoneNameContainer = styled('div')`
  position: fixed;
  top: 50px;
  left: 0;
`;

const AbilityBarContainer = styled('div')`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 10px;
  margin: 0 auto;
  pointer-events: none;
`;

interface HUDWidget<T = any> {
  widget: Widget<T>;
  name: string;
}

export interface HUDProps {
  dispatch: (action: any) => void;
  layout: LayoutState;
  invites: InvitesState;
  data?: any;
}

export interface HUDState extends HUDContextState {
  selectedWidget: HUDWidget | null;
}

class HUD extends React.Component<HUDProps, HUDState> {
  private eventHandles: EventHandle[] = [];

  constructor(props: HUDProps) {
    super(props);
    this.state = {
      selectedWidget: null,
      ...defaultContextState,
    };
  }
  public render() {
    const widgets = this.props.layout.widgets.map((widget, name) => ({ widget, name })).toArray();
    const locked = this.props.layout.locked;
    return (
      <HUDContext.Provider value={this.state}>
        <div className='HUD' style={locked ? {} : { backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          <HUDWidgets />
          <DragStore />
          <ZoneNameContainer>
            <ZoneName />
          </ZoneNameContainer>
          <Console />

          <HUDNavContainer>
            <HUDNav.component {...HUDNav.props} />
          </HUDNavContainer>

          <DevUI />
          <InteractiveAlertView />
          <ScenarioPopup />

          <ScenarioResults />

          <HUDFullScreen />
          <AbilityBarContainer id={'abilitybar'}>
            <AbilityBar />
          </AbilityBarContainer>
          <ContextMenu />
          <TooltipView />
          <PassiveAlert />
          { locked ? null :
            <HUDEditor
              widgets={widgets}
              selectedWidget={ this.state.selectedWidget ? this.state.selectedWidget : null }
              dispatch={this.props.dispatch}
              setSelectedWidget={this.setSelectedWidget}
            />
          }

          <Settings />
          <Watermark />
          <OfflineZoneSelect />
          <LoadingScreen />
        </div>
      </HUDContext.Provider>
    );
  }

  public componentDidMount() {
    // Always load MOTD
    this.setVisibility('motd', true);

    this.props.dispatch(initialize());
    this.props.dispatch(initializeInvites());
    this.initGraphQLContext();

    this.eventHandles.push(game.selfPlayerState.onUpdated(this.handleSelfPlayerStateUpdated));
  }

  public componentWillUnmount() {
    this.eventHandles.forEach(eventHandle => eventHandle.clear());
  }

  public componentWillReceiveProps(props: HUDProps) {
    if (!this.props.data && !props.data) return;
    if (!this.props.data ||
        (props.data && props.data.myOrder && props.data.myOrder.name !==
        (this.props.data && this.props.data.myOrder && this.props.data.myOrder.name))) {

      if (this.props.data && this.props.data.myOrder) game.trigger('chat-leave-room', this.props.data.myOrder.name);

      // we either are just loading up, or we've changed order.
      if (props.data.myOrder && props.data.myOrder.id) {
        // we left our order, leave chat room
        game.trigger('chat-show-room', props.data.myOrder.name);
      }
    }
  }

  private handleSelfPlayerStateUpdated = () => {
    const alive = game.selfPlayerState.isAlive;
    const respawn = this.props.layout.widgets.get('respawn');
    if (!alive && respawn && !respawn.position.visibility) {
      this.setVisibility('respawn', true);
    } else if (respawn && respawn.position.visibility) {
      this.setVisibility('respawn', false);
    }
  }

  private setSelectedWidget = (selectedWidget: HUDWidget) => {
    this.setState({ selectedWidget });
  }

  private initGraphQLContext = async () => {
    const skills = await fetchSkills();
    const statuses = await fetchStatuses();
    this.setState(() => {
      return {
        skills,
        statuses,
      };
    });
  }

  private setVisibility = (widgetName: string, vis: boolean) => {
    this.props.dispatch(setVisibility({ name: widgetName, visibility: vis }));
  }

}

function select(state: SessionState) {
  return {
    layout: state.layout,
    invites: state.invites,
  };
}

export default hot(module)(connect(select)(HUD));
