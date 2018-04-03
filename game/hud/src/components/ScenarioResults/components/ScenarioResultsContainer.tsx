/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

import * as React from 'react';
import * as _ from 'lodash';
import { ql, events, client } from 'camelot-unchained';
import { GraphQLResult } from 'camelot-unchained/lib/graphql/react';
import ScenarioResultsView from './ScenarioResultsView';

export interface TeamInterface {
  teamID: string;
  outcome: ql.schema.ScenarioOutcome;
}

export interface TeamPlayer extends ql.schema.CharacterOutcomeDBModel {
  teamID: string;
}

export interface ScenarioResultsContainerProps {
  graphql: GraphQLResult<{ scenariosummary: ql.schema.ScenarioSummaryDBModel }>;
  scenarioID: string;
}

export interface ScenarioResultsContainerState {
  visible: boolean;
}

class ScenarioResultsContainer extends React.Component<ScenarioResultsContainerProps, ScenarioResultsContainerState> {
  private pollingInterval: any;
  constructor(props: ScenarioResultsContainerProps) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  public render() {
    const { graphql } = this.props;
    const participantsAndTeams = this.getParticipantsAndTeams(graphql.data && graphql.data.scenariosummary);

    const shouldShow = this.state.visible && participantsAndTeams &&
      !_.isEmpty(participantsAndTeams.participants) && !_.isEmpty(participantsAndTeams.teams);
    return (
      <ScenarioResultsView
        visible={shouldShow}
        participants={participantsAndTeams ? participantsAndTeams.participants : []}
        teams={participantsAndTeams ? participantsAndTeams.teams : []}
        onCloseClick={this.onCloseClick}
        status={{ loading: graphql.loading, lastError: graphql.lastError }}
        scenarioID={this.props.scenarioID}
      />
    );
  }

  public componentDidMount() {
    events.on('hudnav--navigate', (name: string) => {
      if (name === 'scenario-results') {
        this.toggleVisibility();
      }
    });
  }

  public shouldComponentUpdate(nextProps: ScenarioResultsContainerProps, nextState: ScenarioResultsContainerState) {
    return this.props.scenarioID !== nextProps.scenarioID ||
      this.state.visible !== nextState.visible ||
      !_.isEqual(this.props.graphql, nextProps.graphql);
  }

  public componentWillUpdate(nextProps: ScenarioResultsContainerProps, nextState: ScenarioResultsContainerState) {
    const scenarioIDChanged = this.props.scenarioID !== nextProps.scenarioID;
    const visibilityChanged = this.state.visible !== nextState.visible;
    if (scenarioIDChanged || visibilityChanged) {
      this.props.graphql.refetch();
    }

    if (nextState.visible && nextProps.graphql.data &&
        nextProps.graphql.data.scenariosummary && _.isEmpty(nextProps.graphql.data.scenariosummary.teamOutcomes)) {
      if (!this.pollingInterval) {
        this.pollingInterval = setInterval(() => this.props.graphql.refetch(), 2000);
      }
    } else {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private onCloseClick = () => {
    events.fire('hudnav--navigate', 'scenario-results');
  }

  private toggleVisibility = () => {
    if (!this.state.visible) {
      client.RequestInputOwnership();
    } else {
      client.ReleaseInputOwnership();
    }
    this.setState({ visible: !this.state.visible });
  }

  private getParticipantsAndTeams = (scenarioSummary: ql.schema.ScenarioSummaryDBModel) => {
    if (scenarioSummary) {
      let participants: TeamPlayer[] = [];
      let teams: TeamInterface[] = [];
      _.forEach(scenarioSummary.teamOutcomes, (_teamOutcome) => {
        participants = participants.concat(_.map(_teamOutcome.participants, participant =>
          ({ ...participant, teamID: _teamOutcome.teamID })));
        teams = teams.concat({ teamID: _teamOutcome.teamID, outcome:  _teamOutcome.outcome });
      });

      return {
        participants,
        teams,
      };
    }
  }
}

export default ScenarioResultsContainer;