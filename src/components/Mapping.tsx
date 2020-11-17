import * as React from 'react';
import withAuthProvider from '../provider/AuthProvider';
import '../css/Mapping.css';
import ClipLoader from "react-spinners/MoonLoader";
import Tenants from './Tenants';
import { saveMapping } from "../service/mappingService";
import azurelogo from '../images/azurelogo.png';
import * as Constants from '../Constants';

interface MapingState {
    success: any,
    error: any,
    loading: boolean
}

class Mapping extends React.Component<any, MapingState> {
    static installationId: string = '';
    static tenantId = '';
    static subscriptionIds: any[] = [];

    constructor(props: any) {
        super(props);
        this.setInstallationId(props.installationId);
        this.state = {
            success: {},
            error: {},
            loading: false
        }
    }
    clearState() {
        this.setState({
            success: {},
            error: {}
        });
    }

    public getData() {
        return {
            "installationId": Mapping.installationId,
            "tenantId": Mapping.tenantId,
            "subscriptionIds": Mapping.subscriptionIds
        }
    }

    public setInstallationId(installationId: any) {
        Mapping.installationId = installationId
    }

    public setTenantId(tenantId: any) {
        Mapping.tenantId = tenantId
        Mapping.subscriptionIds = []
    }

    public setSubscriptionIds(subscriptionIds: any[]) {
        Mapping.subscriptionIds = subscriptionIds;
    }

    saveInstallationMapping(mappingInputs: { installationId: string; tenantId: string; subscriptionIds: any[]; }) {
        this.clearState();
        this.setState({
            loading: true
        });
        if (mappingInputs.installationId && mappingInputs.tenantId && mappingInputs.subscriptionIds) {
            saveMapping(mappingInputs).then(result => {
                this.setState({
                    success: {
                        message: "Successfully saved"
                    },
                    loading: false
                })
            }).catch(ex => {
                this.setState({
                    error: {
                        message: ex.message
                    },
                    loading: false
                })
            });
        }
        else {
            this.setState({
                error: {
                    message: "Installation, Tenant and Subscription required.",
                },
                loading: false
            });
        }
    }

    render() {
        const backgourndImageUrl = `url("devops_log_in.BOhSu5kTfWwcDDxg.svg")`;
        let propsToPass = {
            ...this.props,
            setTenantId: this.setTenantId,
            setSubscriptionId: this.setSubscriptionIds
        }
        return (
            <div className="full-size">
                <div
                    className="background-image"
                    style={backgourndImageUrl ? {
                        backgroundImage: backgourndImageUrl
                    } : undefined}
                >
                    <div className="outer">
                        <div className="inner">
                            <div className="heading-container">
                                <img src={azurelogo} height="20%" width="20%" alt="" />
                                <span className="heading-text">{Constants.MicrosoftAzureHeading}</span>
                            </div>
                            <div className="heading-text margin-top margin-bottom">
                                {Constants.GithubAppHeading}
                            </div>
                            <form
                                onSubmit={(ev) => {
                                    ev.preventDefault();
                                    this.saveInstallationMapping(this.getData());
                                }}
                            >
                                <Tenants {...propsToPass} />
                                <div className="margin-top">
                                    {Constants.GithubAppDescription1}
                                    <a className="link bolt-link" href={Constants.TermsOfServiceLink} rel="noopener noreferrer" target="_blank"> {Constants.TermsOfService}</a>, <a className="link bolt-link" href={Constants.PrivacyStatementLink} rel="noopener noreferrer" target="_blank">{Constants.PrivacyStatement}</a> and <a className="link bolt-link" href={Constants.CodeOfConductLink} rel="noopener noreferrer" target="_blank">
                                        {Constants.CodeOfConduct}
                                    </a>.
                                </div>

                                {
                                    this.state.loading ?
                                        <ClipLoader
                                            size={40}
                                            loading={this.state.loading}
                                        ></ClipLoader> :
                                        <div className="save-button text-right">
                                            <button aria-disabled="false" className="margin-top bolt-button" data-focuszone="" data-is-focusable="true" type="submit" onClick={(ev) => {
                                                ev.preventDefault();
                                                this.saveInstallationMapping(this.getData());
                                            }}>
                                                <span className="bolt-button-text body-m">{Constants.SaveButtonText}</span>
                                            </button>
                                        </div>
                                }
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withAuthProvider(Mapping);