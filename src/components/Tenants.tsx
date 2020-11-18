import React from 'react';
import { msalConfig } from '../config/Config';
import { getTenants } from '../service/tenantService';
import withAuthProvider from '../provider/AuthProvider';
import Subscriptions from './Subscriptions';
import { SelectMenu, Button } from '@primer/components';
import down from '../images/downarrow.png';
import * as Constants from "../Constants";

interface TenantsState {
  tenants: {
    value: any[]
  },
  selectedTenantId: string,
  selectedTenantName: string
}

class Tenants extends React.Component<any, TenantsState> {
  constructor(props: any) {
    super(props);

    this.state = {
      tenants: {
        value: []
      },
      selectedTenantId: '',
      selectedTenantName: ''
    };
  }

  async componentDidMount() {
    try {
      let accessToken = await this.props.getAccessToken('', msalConfig.scopes);
      let tenants = await getTenants(accessToken);
      this.setState({ tenants: tenants });
    }
    catch (err) {
      this.props.setError('ERROR', JSON.stringify(err));
    }
  }
  render() {
    let subscriptionProps: any = {
      ...this.props,
      tenantId: this.state.selectedTenantId
    };
    var options = this.state.tenants && this.state.tenants.value &&
      this.state.tenants.value.length > 0 &&
      this.state.tenants.value.map(tenant =>
        <SelectMenu.Item className="formitem-selectmenu-item" onClick={() => {
          this.props.setTenantId(tenant.tenantId);
          this.setState({ selectedTenantId: tenant.tenantId, selectedTenantName: tenant.displayName });
        }} key={tenant.tenantId}>
          {tenant.displayName}
        </SelectMenu.Item>
      )
    return (
      <div>
        <label className="formitem-label margin-bottom">{Constants.SelectAzureTenantLabel}</label>
        <SelectMenu className="formitem-dropdown margin-bottom">
          <Button as="summary" className="formitem-button">
            <span className="formitem-button-value small-text">{this.state.selectedTenantName}</span>
            <img className="formitem-dropdown-arrow down-img" alt="" src={down} width="16px" height="16px" />
          </Button>
          <SelectMenu.Modal>
            <SelectMenu.List>
              {options}
            </SelectMenu.List>
          </SelectMenu.Modal>
        </SelectMenu>
        <Subscriptions {...subscriptionProps}></Subscriptions>
      </div>
    );
  }
}

export default withAuthProvider(Tenants);