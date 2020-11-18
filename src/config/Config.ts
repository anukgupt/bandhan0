export const msalConfig = {
    appId: 'a79fd610-c111-4b27-8bcb-d122bb624b96', 
    authority: 'https://login.microsoftonline.com/',
    redirectUri: 'http://localhost:3000/',
    scopes: ['https://management.azure.com/user_impersonation', "User.Read"],
    azureApiScopes: [
        'https://management.azure.com/user_impersonation'
    ]
};

