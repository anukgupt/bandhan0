import React from 'react';
import { msalConfig } from '../config/Config';
import { getSubscriptions } from '../service/subscriptionService';
import withAuthProvider from '../provider/AuthProvider';
import { Button, SelectMenu } from '@primer/components';
import cross from '../images/cross.png';
import Mapping from './Mapping';

interface SubscriptionParameters {
  subscriptions: any[],
  filteredSubscriptions: any[],
  finalSubscriptionList: any[],
  currentTenantId: string,
  showSubscriptionFilter: boolean;
  subscriptionRadioButtonValue: string;
  filteredSubscriptionValue: string;
}

interface SubscriptionState {
  subscriptionParameters: SubscriptionParameters;
}

export class Subscription extends React.Component<any, SubscriptionState> {
  constructor(props: any) {
    super(props);
    //this.props.clearState();
    let subscriptionParameters: SubscriptionParameters = {
      subscriptions: [],
      filteredSubscriptions: [],
      finalSubscriptionList: [],
      currentTenantId: '',
      showSubscriptionFilter: false,
      subscriptionRadioButtonValue: "All Subscriptions",
      filteredSubscriptionValue: ""
    }
    this.state = {
      subscriptionParameters: subscriptionParameters
    };
  }

  setSubscriptionParameters(subscriptionParameters: SubscriptionParameters) {
    this.setState({ subscriptionParameters: subscriptionParameters });
  }
  async componentDidUpdate() {
    try {
      let subscriptionParameters = this.state.subscriptionParameters;
      if (this.props.tenantId !== this.state.subscriptionParameters.currentTenantId) {
        if (this.props.tenantId) {
          var accessToken = await this.props.getAccessToken(this.props.tenantId, msalConfig.azureApiScopes);
          var subscriptions = await getSubscriptions(accessToken);
          // if (subscriptions && subscriptions.value && subscriptions.value.length > 0) {
          //   this.props.setSubscriptionId(subscriptions.value[0].subscriptionId);
          // }
          subscriptionParameters.subscriptions = subscriptions.value;
          subscriptionParameters.currentTenantId = this.props.tenantId;
          subscriptionParameters.filteredSubscriptions = subscriptions.value;
          subscriptionParameters.finalSubscriptionList = [];
          this.setSubscriptionParameters(subscriptionParameters);
        } else {
          subscriptionParameters.subscriptions = [];
          subscriptionParameters.currentTenantId = '';
          this.setSubscriptionParameters(subscriptionParameters);
        }
      }
    }
    catch (err) {
      this.props.setError('ERROR', JSON.stringify(err));
    }
  }

  render() {
    let options = this.state.subscriptionParameters.filteredSubscriptions && this.state.subscriptionParameters.filteredSubscriptions.length > 0 &&
      this.state.subscriptionParameters.subscriptions.map(subs =>
        <SelectMenu.Item className="formitem-selectmenu-item" onClick={(event: any) => { this.onSelectingSubscription(event) }}>{subs.displayName}</SelectMenu.Item>
      );
    let finalList: any = [];
    this.state.subscriptionParameters.finalSubscriptionList.map(subs => {
      finalList.push(
        <div className="subscription-item">
          <span className="subscription-item-name">{subs.displayName}</span>
          <Button type="button" aria-label="close menu" className="subscription-cross-img-button" onClick={() => {
            this.onRemovalOfSubscription(subs.displayName)
          }}>
            <img className="cross-img" alt="" src={cross} width="10" height="10" />
          </Button>
        </div>
      )
    });
    return (
      <div>
        <div>
          <td>
            <label className="input-radio-label">
              <input className="input-radio" type="radio" onChange={() => this.onAllSubscriptionsRadioButton()} checked={this.state.subscriptionParameters.subscriptionRadioButtonValue === "All Subscriptions"} value="All Subscriptions" />All Subscriptions
                </label>
          </td>
          <p className="note small-text">This applies to all subscriptions.</p>
          <td>
            <label className="input-radio-label">
              <input className="input-radio" type="radio" onChange={() => this.onSelectSubscriptionsRadionButon()} checked={this.state.subscriptionParameters.subscriptionRadioButtonValue === "Select Subscriptions"} value="Select Subscriptions" />Select Subscriptions
                </label>
          </td>
        </div>
        {
          this.state.subscriptionParameters.showSubscriptionFilter &&
          <SelectMenu className="subscription-filter-dropdown">
            <Button as="summary">Only Select Subscriptions</Button>
            <SelectMenu.Modal>
              <SelectMenu.Filter onChange={(event: any) => { this.onFilteringSubscription(event.target.value) }} placeholder="Search for a subscription" value={this.state.subscriptionParameters.filteredSubscriptionValue} aria-label="Search for a subscription" />
              <SelectMenu.List>
                {options}
              </SelectMenu.List>
            </SelectMenu.Modal>
          </SelectMenu>
        }
        {
          this.state.subscriptionParameters.showSubscriptionFilter && this.state.subscriptionParameters.finalSubscriptionList && this.state.subscriptionParameters.finalSubscriptionList.length > 0 &&
          <div className="margin-top">
            <span className="heading-subscriptions-selected">Selected {this.state.subscriptionParameters.finalSubscriptionList.length} subscriptions</span>
            <div className="selected-subs-list">
              {
                finalList
              }
            </div>
          </div>
        }
      </div >
    )
  }
  filterSubscriptions(searchValue: string, subscriptionParameters: SubscriptionParameters): SubscriptionParameters {
    let subs: any[] = [];
    let isPresentInFinalList: boolean = false;
    subscriptionParameters.subscriptions.filter(sub => {
      isPresentInFinalList = false;
      subscriptionParameters.finalSubscriptionList.map(finalsub => {
        if (sub.displayName === finalsub.displayName) {
          isPresentInFinalList = true;
        }
      });
      if (sub.displayName.toString().toLowerCase().indexOf(searchValue.toString().toLowerCase()) !== -1 && !isPresentInFinalList)
        subs.push(sub);
    });
    subscriptionParameters.filteredSubscriptions = subs;
    subscriptionParameters.filteredSubscriptionValue = searchValue;
    return subscriptionParameters;
  }

  onFilteringSubscription(searchValue: string) {
    let subscriptionParameters = this.filterSubscriptions(searchValue, this.state.subscriptionParameters);
    this.setSubscriptionParameters(subscriptionParameters);
  }

  onSelectingSubscription(event: any | React.MouseEvent<HTMLInputElement, MouseEvent>) {
    let subscriptionParameters = this.state.subscriptionParameters;
    let subs = subscriptionParameters.finalSubscriptionList;
    let tobeAddedSubscription = subscriptionParameters.filteredSubscriptions.filter(sub => {
      return (sub.displayName.indexOf(event.target.innerText) !== -1);
    });
    subs[subscriptionParameters.finalSubscriptionList.length] = tobeAddedSubscription[0];
    subscriptionParameters.finalSubscriptionList = subs;
    subscriptionParameters = this.filterSubscriptions("", subscriptionParameters);
    this.props.setSubscriptionId(subscriptionParameters.finalSubscriptionList);
    this.setSubscriptionParameters(subscriptionParameters);
  }

  onAllSubscriptionsRadioButton() {
    let subscriptionParameters = this.state.subscriptionParameters;
    subscriptionParameters.subscriptionRadioButtonValue = "All Subscriptions";
    subscriptionParameters.showSubscriptionFilter = false;
    this.setSubscriptionParameters(subscriptionParameters);
  }

  onSelectSubscriptionsRadionButon() {
    let subscriptionParameters = this.state.subscriptionParameters;
    subscriptionParameters.subscriptionRadioButtonValue = "Select Subscriptions";
    subscriptionParameters.showSubscriptionFilter = true;
    this.setSubscriptionParameters(subscriptionParameters);
  }

  onRemovalOfSubscription(subscriptionDisplayName: string) {
    let subscriptionParameters = this.state.subscriptionParameters;
    let subs = subscriptionParameters.finalSubscriptionList;
    let indexToBeDeleted = -1;
    subs.map((subs, index) => {
      if (subs.displayName === subscriptionDisplayName) {
        indexToBeDeleted = index;
      }
    });
    if (indexToBeDeleted !== -1) {
      subs.splice(indexToBeDeleted, 1);
      subscriptionParameters.finalSubscriptionList = subs;
      subscriptionParameters = this.filterSubscriptions("", subscriptionParameters);
      this.props.setSubscriptionId(subscriptionParameters.finalSubscriptionList);
      this.setSubscriptionParameters(subscriptionParameters);
    }
  }
}

export default withAuthProvider(Subscription);