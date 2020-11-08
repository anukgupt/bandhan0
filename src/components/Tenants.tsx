import React from 'react';
import { msalConfig } from '../config/Config';
import { getTenants } from '../service/tenantService';
import withAuthProvider from '../provider/AuthProvider';
import Subscriptions from './Subscriptions';
import { Dropdown, SelectMenu, Button } from '@primer/components';
import down from '../images/downarrow.png';

interface TenantsState {
  tenants: {
    value: any[]
  },
  selectedTenant: string
}

class Tenants extends React.Component<any, TenantsState> {
  constructor(props: any) {
    super(props);

    this.state = {
      tenants: {
        value: []
      },
      selectedTenant: ''
    };
  }

  async componentDidMount() {
    try {
      // this.props.clearState();
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
      tenantId: this.state.selectedTenant
    };
    var options = this.state.tenants && this.state.tenants.value &&
      this.state.tenants.value.length > 0 &&
      this.state.tenants.value.map(tenant =>
        <SelectMenu.Item className="formitem-selectmenu-item" onClick={() => {
          this.props.setTenantId(tenant.tenantId);
          this.setState({ selectedTenant: tenant.displayName });
        }} key={tenant.tenantId}>
          {tenant.displayName}
        </SelectMenu.Item>
      )
    return (
      <div className="form">
        <label className="formitem-label margin-bottom">Select your Azure Tenant</label>
        <SelectMenu className="formitem-dropdown margin-bottom">
          <Button as="summary" className="formitem-button">
            <span className="formitem-button-value small-text">{this.state.selectedTenant}</span>
            <img className="formitem-dropdown-arrow down-img" alt="" src={down} width="16" height="16" />
          </Button>
          <SelectMenu.Modal className="formitem-selectmenu-modal">
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