import React from 'react';
import { UserAgentApplication } from 'msal';
import { msalConfig } from "../config/Config";

interface AuthProviderState {
    error: any;
    isAuthenticated: boolean;
    currentAuthority: string;
}

export default function withAuthProvider<T extends React.Component<any>>
    (WrappedComponent: new (props: any, context?: any) => T): React.ComponentClass {
    return class extends React.Component<any, AuthProviderState> {
        private userAgentApplication: UserAgentApplication;

        constructor(props: any) {
            super(props);
            this.state = {
                error: null,
                isAuthenticated: false,
                currentAuthority: ""
            };
            this.userAgentApplication = new UserAgentApplication({
                auth: {
                    clientId: msalConfig.appId,
                    redirectUri: msalConfig.redirectUri
                },
                cache: {
                    cacheLocation: "sessionStorage",
                    storeAuthStateInCookie: true
                }
            });
        }

        render(): React.ReactNode {
            return <WrappedComponent
                login={() => this.login()}
                logout={() => this.logout()}
                getAccessToken={(authority: any, scopes: string[]) => this.getAccessToken(authority, scopes)}
                setError={(message: string, debug: string) => this.setErrorMessage(message, debug)}
                {...this.props} {...this.state}
            />;
        }

        async login(authority: any = undefined) {
            let userRequest = {
                scopes: msalConfig.scopes,
                authority: msalConfig.authority + 'common',
                response_type: "code", //or id_token??
            }
            if (authority) {
                userRequest.authority = authority;
            }
            try {
                let data = await this.userAgentApplication.loginPopup(userRequest);
                this.setState({
                    isAuthenticated: true,
                    error: null,
                    currentAuthority: data.tenantId
                });
            }
            catch (err) {
                console.log(err);
                this.setState({
                    isAuthenticated: false,
                    error: this.normalizeError(err)
                });
            }
        }

        async getAccessToken(authority: string, scopes: string[]): Promise<string> {
            try {
                let requestAuthority;
                if (!this.state.currentAuthority)
                    await this.login();
                else if (authority && authority !== this.state.currentAuthority) {
                    requestAuthority = msalConfig.authority + authority;
                    await this.login(requestAuthority);
                }
                if (!requestAuthority) {
                    requestAuthority = msalConfig.authority + 'common';
                }
                var silentResult = await this.userAgentApplication
                    .acquireTokenSilent({
                        scopes: scopes,
                        authority: requestAuthority
                    });

                return silentResult && silentResult.accessToken;
            } catch (err) {
                console.log(err);
                // If a silent request fails, it may be because the user needs
                // to login or grant consent to one or more of the requested scopes
                if (this.isInteractionRequired(err)) {
                    var interactiveResult = await this.userAgentApplication
                        .acquireTokenPopup({
                            scopes: scopes,
                            redirectUri: 'https://localhost:3000/'
                        });

                    return interactiveResult.accessToken;
                } else {
                    throw err;
                }
            }
        }

        logout() {
            this.userAgentApplication.logout();
        }

        setErrorMessage(message: string, debug: string) {
            this.setState({
                error: { message: message, debug: debug }
            });
        }

        normalizeError(error: string | Error): any {
            var normalizedError = {};
            if (typeof (error) === 'string') {
                var errParts = error.split('|');
                normalizedError = errParts.length > 1 ?
                    { message: errParts[1], debug: errParts[0] } :
                    { message: error };
            } else {
                normalizedError = {
                    message: error.message,
                    debug: JSON.stringify(error)
                };
            }
            return normalizedError;
        }

        isInteractionRequired(error: Error): boolean {
            if (!error.message || error.message.length <= 0) {
                return false;
            }

            return (
                error.message.indexOf('consent_required') > -1 ||
                error.message.indexOf('interaction_required') > -1 ||
                error.message.indexOf('login_required') > -1 ||
                error.message.indexOf('no_account_in_silent_request') > -1
            );
        }
    }
}