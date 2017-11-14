/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { client, PlayerState } from 'camelot-unchained';
import styled from 'react-emotion';

const Container = styled('div')`
  width: 415px;
  height: 248.3px;
`;

import PlayerStatusComponent from './PlayerStatusComponent';

export interface PlayerHealthProps {
  containerClass?: string;
  isMini?: boolean;
}

export interface PlayerHealthState extends PlayerState {
}

class PlayerHealth extends React.PureComponent<PlayerHealthProps, PlayerHealthState> {
  constructor(props: PlayerHealthProps) {
    super(props);
  }

  public render() {
    if (!this.state) return null;
    return (
      <Container>
        <PlayerStatusComponent
          containerClass='PlayerHealth'
          playerState={this.state}
        />
      </Container>
    );
  }

  public componentDidMount() {
    client.OnPlayerStateChanged(this.setPlayerState);
  }

  private setPlayerState = (state: PlayerState) => {
    this.setState(state);
  }
}

export default PlayerHealth;