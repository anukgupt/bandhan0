import React from 'react';
import { msalConfig } from '../config/Config';
import { getSubscriptions } from '../service/subscriptionService';
import withAuthProvider from '../provider/AuthProvider';
import { Button, SelectMenu } from '@primer/components';
import cross from '../images/cross.png';
import * as Constants from "../Constants";

interface SubscriptionParameters {
  subscriptions: any[],
  filteredSubscriptions: any[],
  finalSubscriptionList: any[],
  currentTenantId: string,
  showSubscriptionFilter: boolean;
  subscriptionRadioButtonValue: string;
  searchValueForSubscriptions: string;
}

interface SubscriptionState {
  subscriptionParameters: SubscriptionParameters;
}

export class Subscription extends React.Component<any, SubscriptionState> {
  constructor(props: any) {
    super(props);
    this.props.clearState();
    let subscriptionParameters: SubscriptionParameters = {
      subscriptions: [],
      filteredSubscriptions: [],
      finalSubscriptionList: [],
      currentTenantId: '',
      showSubscriptionFilter: false,
      subscriptionRadioButtonValue: Constants.AllSubscriptionsRadioButtonValue,
      searchValueForSubscriptions: ""
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
          subscriptionParameters.subscriptions = subscriptions.value;
          subscriptionParameters.currentTenantId = this.props.tenantId;
          subscriptionParameters.filteredSubscriptions = subscriptions.value;

        } else {
          subscriptionParameters.subscriptions = [];
          subscriptionParameters.currentTenantId = '';
          subscriptionParameters.filteredSubscriptions = [];
        }
        subscriptionParameters.finalSubscriptionList = [];
        subscriptionParameters.showSubscriptionFilter = false;
        subscriptionParameters.subscriptionRadioButtonValue = Constants.AllSubscriptionsRadioButtonValue;
        subscriptionParameters.searchValueForSubscriptions = "";
        this.props.setSubscriptionIds(subscriptionParameters.subscriptions);
        this.setSubscriptionParameters(subscriptionParameters);
      }
    }
    catch (err) {
      this.props.setError('ERROR', JSON.stringify(err));
    }
  }

  render() {
    let options = this.state.subscriptionParameters.filteredSubscriptions && this.state.subscriptionParameters.filteredSubscriptions.length > 0 &&
      this.state.subscriptionParameters.filteredSubscriptions.map(subs =>
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
            <img className="cross-img" alt="" src={cross} width="10%" height="10%" />
          </Button>
        </div>
      )
    });
    return (
      <div>
        <div>
          <label className="input-radio-label">
            <input className="input-radio" type="radio" onChange={() => this.onAllSubscriptionsRadioButton()} checked={this.state.subscriptionParameters.subscriptionRadioButtonValue === Constants.AllSubscriptionsRadioButtonValue} value={Constants.AllSubscriptionsRadioButtonValue} />{Constants.AllSubscriptionsRadioButtonValue}
          </label>
        </div>
        <p className="note small-text">{Constants.AllSubscriptionsRadioButtonNote}</p>
        <div>
          <label className="input-radio-label">
            <input className="input-radio" type="radio" onChange={() => this.onSelectSubscriptionsRadionButon()} checked={this.state.subscriptionParameters.subscriptionRadioButtonValue === Constants.SelectSubscriptionsRadioButtonValue} value={Constants.SelectSubscriptionsRadioButtonValue} />{Constants.SelectSubscriptionsRadioButtonValue}
          </label>
        </div>
        {
          this.state.subscriptionParameters.showSubscriptionFilter &&
          <SelectMenu className="subscription-filter-dropdown">
            <Button as="summary">{Constants.SelectSubscriptionsDropdownValue}</Button>
            <SelectMenu.Modal>
              <SelectMenu.Filter onChange={(event: any) => { this.onFilteringSubscription(event.target.value) }} placeholder={Constants.DropdownFilterAriaLabel} value={this.state.subscriptionParameters.searchValueForSubscriptions} aria-label={Constants.DropdownFilterAriaLabel} />
              <SelectMenu.List>
                {
                  options
                }
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
    let filteredSubs: any[] = [];
    let isPresentInFinalList: boolean = false;
    subscriptionParameters.subscriptions.filter(sub => {
      isPresentInFinalList = false;
      subscriptionParameters.finalSubscriptionList.map(finalsub => {
        if (sub.displayName === finalsub.displayName) {
          isPresentInFinalList = true;
        }
      });
      if (sub.displayName.toString().toLowerCase().indexOf(searchValue.toString().toLowerCase()) !== -1 && !isPresentInFinalList)
        filteredSubs.push(sub);
    });
    subscriptionParameters.filteredSubscriptions = filteredSubs;
    subscriptionParameters.searchValueForSubscriptions = searchValue;
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
    this.props.setSubscriptionIds(subscriptionParameters.finalSubscriptionList);
    this.setSubscriptionParameters(subscriptionParameters);
  }

  onAllSubscriptionsRadioButton() {
    let subscriptionParameters = this.state.subscriptionParameters;
    subscriptionParameters.subscriptionRadioButtonValue = Constants.AllSubscriptionsRadioButtonValue;
    subscriptionParameters.showSubscriptionFilter = false;
    this.props.setSubscriptionIds(subscriptionParameters.subscriptions);
    this.setSubscriptionParameters(subscriptionParameters);
  }

  onSelectSubscriptionsRadionButon() {
    let subscriptionParameters = this.state.subscriptionParameters;
    subscriptionParameters.subscriptionRadioButtonValue = Constants.SelectSubscriptionsRadioButtonValue;
    subscriptionParameters.showSubscriptionFilter = true;
    this.props.setSubscriptionIds([]);
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
      this.props.setSubscriptionIds(subscriptionParameters.finalSubscriptionList);
      this.setSubscriptionParameters(subscriptionParameters);
    }
  }
}

export default withAuthProvider(Subscription);