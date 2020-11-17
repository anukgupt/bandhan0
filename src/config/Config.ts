// export const msalConfig = {
//     appId: '054b8429-e7dd-4c3d-8aee-f96754e8f9b2',
//     redirectUri: 'http://localhost:3000/',
//     authority: 'https://login.microsoftonline.com/',
//     scopes: [
//         // 'https://management.core.windows.net/user_impersonation',
//         'https://management.azure.com/user_impersonation',
//         'user.read'
//     ],
//     azureApiScopes: [
//         'https://management.core.windows.net/user_impersonation'
//     ]
// };

export const msalConfig = {
    appId: 'a79fd610-c111-4b27-8bcb-d122bb624b96', 
    authority: 'https://login.microsoftonline.com/',
    //https://login.microsoftonline.com/organizations
    redirectUri: 'http://localhost:3000/',
    scopes: ['https://management.azure.com/user_impersonation', "User.Read"],
    azureApiScopes: [
        'https://management.core.windows.net/user_impersonation'
    ]
};

