/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

import gql from 'graphql-tag';
import * as React from 'react';
import { Spinner } from '@csegames/camelot-unchained';
import { GraphQL, GraphQLResult } from '@csegames/camelot-unchained/lib/graphql/react';
import {
  LoadingContainer,
  InnerContainer,
  ProgressionTitle,
  ProgressionCorner,
  ProgressionContent,
  ProgressionLoading,
  ProgressionFooter,
} from './style';
import { RewardsViewGQL, CharacterAdjustmentReasonGQLField } from 'gql/interfaces';

const progressionAdjustmentFragments = gql`
  fragment RewardsViewItemDefinition on ItemDefRef {
    id
    numericItemDefID
    defaultResourceID
    iconUrl
    name
    description
    tags
    itemType
  }

  fragment RewardsViewSkillPartDefinition on SkillPartDef {
    icon
    id
    name
  }

  fragment RewardsViewSkillPartLevelReason on CharacterAdjustmentReasonSkillPartLevel {
    skillPartID
    skillPartLevel
    skillPartDef {
      ...RewardsViewSkillPartDefinition
    }
  }

  fragment RewardsViewUseSkillPartReason on CharacterAdjustmentReasonUseSkillPart {
    skillID
    inCombatCount
    nonCombatCount
    skillPartDef {
      ...RewardsViewSkillPartDefinition
    }
  }

  fragment RewardsViewUseSkillsReason on CharacterAdjustmentReasonUseSkills {
    inCombatCount
    nonCombatCount
  }

  fragment RewardsViewAddItemAdjustment on CharacterAdjustmentAddItem {
    itemInstanceIDS
    staticDefinitionID
    unitCount
    quality
    itemDef {
      ...RewardsViewItemDefinition
    }
  }

  fragment RewardsViewPlayerStatAdjustment on CharacterAdjustmentPlayerStat {
    playerStat
    previousBonus
    newBonus
    previousProgressionPoints
    newProgressionPoints
  }

  fragment RewardsViewSkillPartAdjustment on CharacterAdjustmentSkillPartProgress {
    skillPartID
    previousLevel
    previousProgressionPoints
    newLevel
    newProgressPoints
    skillPartDef {
      ...RewardsViewSkillPartDefinition
    }
  }

  fragment RewardsViewSkillNodeAdjustment on CharacterAdjustmentApplySkillNode {
    skillNodePath
  }

  fragment RewardsViewAdjustmentModel on CharacterAdjustmentDBModel {
    reason {
      skillPartLevel {
        ...RewardsViewSkillPartLevelReason
      }
      useSkillPart {
        ...RewardsViewUseSkillPartReason
      }
      useSkills {
        ...RewardsViewUseSkillsReason
      }
    }
    adjustment {
      addItem {
        ...RewardsViewAddItemAdjustment
      }
      playerStat {
        ...RewardsViewPlayerStatAdjustment
      }
      skillPart {
        ...RewardsViewSkillPartAdjustment
      }
      skillNode {
        ...RewardsViewSkillNodeAdjustment
      }
    }
  }
`;

const adjustmentsByDayLogIDQuery = gql`
  query RewardsViewGQL($logID: String!) {
    myprogression {
      adjustmentsByDayLogID(logID: $logID) {
        ...RewardsViewAdjustmentModel
      }
    }
  }
  ${progressionAdjustmentFragments}
`;

export interface Props {
  logID: string;
}

export interface State {

}

class RewardsView extends React.Component<Props, State> {
  public render() {
    const query = adjustmentsByDayLogIDQuery;
    const variables = {
      logID: this.props.logID,
    };
    return (
      <GraphQL query={{ query, variables }}>
        {(graphql: GraphQLResult<RewardsViewGQL.Query>) => {
          if (graphql.lastError && graphql.lastError !== 'OK') {
            return (
            <LoadingContainer>
              <ProgressionTitle><h6>Progression</h6></ProgressionTitle>
              <InnerContainer>
                <ProgressionCorner />
                <ProgressionContent>
                  <ProgressionLoading>
                  <div>{graphql.lastError}</div>
                  </ProgressionLoading>
                </ProgressionContent>
                <ProgressionFooter />
              </InnerContainer>
            </LoadingContainer>
            );
          }
          if (graphql.loading || !graphql.data || !graphql.data.myprogression) {
            return (
              <LoadingContainer>
                <ProgressionTitle><h6>Progression</h6></ProgressionTitle>
                <InnerContainer>
                  <ProgressionCorner />
                  <ProgressionContent>
                    <ProgressionLoading>
                      <div>Loading...</div>
                      <Spinner />
                    </ProgressionLoading>
                  </ProgressionContent>
                  <ProgressionFooter />
                </InnerContainer>
              </LoadingContainer>
            );
          }
          return this.showRewards(graphql.data.myprogression);
        }}
      </GraphQL>
    );
  }

  private showRewards(progressionData: RewardsViewGQL.Myprogression) {
    if (!progressionData.adjustmentsByDayLogID || progressionData.adjustmentsByDayLogID.length === 0) {
      return null;
    } else {
      const rewardsList: JSX.Element[] = [];
      const progressionList: JSX.Element[] = [];

      progressionData.adjustmentsByDayLogID.forEach((adjustment, adjustmentID) => {
        const { addItem, playerStat, skillNode, skillPart } = adjustment.adjustment;
        const {
          skillPartLevel,
          useSkillPart,
          useSkills,
          adminGrant,
        } = adjustment.reason as CharacterAdjustmentReasonGQLField;

        let reasonDescription: JSX.Element = null;
        if (skillPartLevel) {
          // Reason is skill level up
          reasonDescription =
            <span>
              Obtained Level {skillPartLevel.skillPartLevel} {skillPartLevel.skillPartDef.name}
            </span>;
        } else if (useSkillPart) {
          // Reason is individual skill usage
          reasonDescription =
            <span>
              Used {useSkillPart.skillPartDef.name} {useSkillPart.inCombatCount + useSkillPart.nonCombatCount}&nbsp;
              time{useSkillPart.inCombatCount + useSkillPart.nonCombatCount > 1 ? 's' : null}
            </span>;
        } else if (useSkills) {
          // Reason is related skill usage
          reasonDescription =
            <span>
              Used related skill {useSkills.inCombatCount + useSkills.nonCombatCount}&nbsp;
              time{useSkills.inCombatCount + useSkills.nonCombatCount > 1 ? 's' : null}
            </span>;
        } else if (adminGrant) {
          // Given by Administrator
          reasonDescription = <span>Granted by Administrator</span>;
        }

        if (
          // Adjustment is a reward - add to rewardsList
          addItem
          || (playerStat && playerStat.newBonus !== playerStat.previousBonus)
          || skillNode
          || (skillPart && skillPart.newLevel !== skillPart.previousLevel)
        ) {
          if (addItem) {
            // New item was received
            rewardsList.push(
              <li key={'adj' + adjustmentID}>
                <div className='ProgressionInfo'>
                  <div className='RewardLabel'>
                    Received <img height='20px' width='20px' src={addItem.itemDef.iconUrl} />&nbsp;
                    {addItem.staticDefinitionID} x {addItem.unitCount}
                  </div>
                  <div className='RewardValue'>{reasonDescription}</div>
                </div>
              </li>
            ,);
          } else if (playerStat && playerStat.newBonus !== playerStat.previousBonus) {
            // New Attribute Bonus was received
            rewardsList.push(
              <li key={'adj' + adjustmentID}>
                <div className='ProgressionInfo'>
                  <div className='RewardLabel'>
                    Bonus +{playerStat.newBonus - playerStat.previousBonus} applied to {playerStat.playerStat}
                  </div>
                  <div className='RewardValue'>{reasonDescription}</div>
                </div>
              </li>
            ,);
          } else if (skillNode) {
            // New Skill Node was applied
            rewardsList.push(
              <li key={'adj' + adjustmentID}>
                <div className='ProgressionInfo'>
                  <div className='RewardLabel'>
                    Skill Node Applied: {skillNode.skillNodePath}
                  </div>
                </div>
              </li>
            ,);
          } else if (skillPart.newLevel !== skillPart.previousLevel) {
            // New Skill Component Level obtained
            rewardsList.push(
              <li key={'adj' + adjustmentID}>
                <div className='ProgressionInfo'>
                  <div className='RewardLabel'>
                    <img height='20px' width='20px' src={skillPart.skillPartDef.icon} />&nbsp;
                    Obtained Level {skillPart.newLevel} {skillPart.skillPartDef.name}
                  </div>
                  <div className='RewardValue'>{reasonDescription}</div>
                </div>
              </li>
            ,);
          }
        } else if (
          // Adjustment is a progression point increasion - add to progressionList
          (playerStat && playerStat.newProgressionPoints - playerStat.previousProgressionPoints > 0)
          || (skillPart && skillPart.newProgressPoints - skillPart.previousProgressionPoints > 0)
        ) {
          if (playerStat && playerStat.newProgressionPoints - playerStat.previousProgressionPoints > 0) {
            // Character (Attribute) progression
            progressionList.push(
              <li key={'adj' + adjustmentID}>
                <div className='ProgressionInfo'>
                  <div className='ProgressionLabel'>{playerStat.playerStat}</div>
                  <div className='ProgressionValue2'>
                    {playerStat.newProgressionPoints - playerStat.previousProgressionPoints}
                  </div>
                  <div className='ProgressionValue2'>{reasonDescription}</div>
                </div>
              </li>
            ,);
          } else if (skillPart && skillPart.newProgressPoints - skillPart.previousProgressionPoints > 0) {
            // Skill Component progression
            progressionList.push(
              <li key={'adj' + adjustmentID}>
                <div className='ProgressionInfo'>
                  <div className='ProgressionLabel'>
                    <img height='20px' width='20px' src={skillPart.skillPartDef.icon} /> {skillPart.skillPartDef.name}
                  </div>
                  <div className='ProgressionValue2'>
                    {skillPart.newProgressPoints - skillPart.previousProgressionPoints}
                  </div>
                  <div className='ProgressionValue2'>{reasonDescription}</div>
                </div>
              </li>
            ,);
          }
        }
      });

      return (
        <div>
          { progressionList.length > 0 ?
            <ul>
              <h3>Progression</h3>
              <li className='ProgressHeader'>
                <div className='ProgressionLabelHeader'>Component / Attribute</div>
                <div className='ProgressionValue2Header'>Points Obtained</div>
                <div className='ProgressionValue2Header'>Reason</div>
              </li>
              { progressionList }
            </ul>
          : null }
          { rewardsList.length > 0 ?
            <ul>
              <h3 className='RewardHeadline'>Rewards</h3>
              <li className='ProgressHeader'>
                <div className='RewardLabelHeader'>Reward</div>
                <div className='RewardValueHeader'>Reason</div>
              </li>
              { rewardsList }
            </ul>
          : null }
        </div>
      );
    }
  }
}

export default RewardsView;
