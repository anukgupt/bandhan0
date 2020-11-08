import React, { Component } from 'react';
import withAuthProvider from '../provider/AuthProvider';
import Mapping from './Mapping';
// import { Uri, urlSearchParamsGet } from '../providers/Url';

class App extends Component {
  installationId: string = '';
  constructor(props: any) {
    super(props);
    // let url: Uri = new Uri(window.location.href)
    // const urlParams = url.queryParameters;
    // this.installationId = urlSearchParamsGet(urlParams, "installation_id") || '';
  }
  render() {
    let propstopass = {...this.props, installationId: this.installationId};
    return (
      <Mapping {...propstopass}></Mapping>
    );
  }
}
export default withAuthProvider(App);