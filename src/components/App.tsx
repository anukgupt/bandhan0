import React, { Component } from 'react';
import withAuthProvider from '../provider/AuthProvider';
import Mapping from './Mapping';

class App extends Component {
  installationId: string = '';
  constructor(props: any) {
    super(props);
    let url: URL = new URL(window.location.href);
    const queryString = new URLSearchParams(url.search);
    if (queryString.has("installation_id")) {
      var installationId = queryString.get("installation_id");
      this.installationId = installationId !== null ? installationId : "";
    }
    else {
      this.installationId = "";
    }
  }
  render() {
    let propstopass = { ...this.props, installationId: this.installationId };
    return (
      <Mapping {...propstopass}></Mapping>
    );
  }
}
export default withAuthProvider(App);