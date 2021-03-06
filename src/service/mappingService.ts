import { handleResponse } from "./serviceHelper";

export async function saveMapping(mappingInputs: { installationId: string; tenantId: string; subscriptionIds: any[]; }) {
    var subscriptionIds: string[] = [];
    mappingInputs.subscriptionIds.map(subsId => {
        subscriptionIds.push(subsId.subscriptionId)
    });
    var url = "https://localhost:44384/api/installationmapping";
    return fetch(url, {
        method: 'PUT',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            "InstallationId": parseInt(mappingInputs.installationId),
            "TenantId": mappingInputs.tenantId,
            "SubscriptionIds": subscriptionIds
        })
    }).then(responseJson => {
        return handleResponse(responseJson);
    }).catch(error => {
        throw error;
    });
}