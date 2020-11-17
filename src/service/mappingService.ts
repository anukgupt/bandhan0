import { handleResponse } from "./serviceHelper";

export async function saveMapping(mappingInputs: { installationId: string; tenantId: string; subscriptionIds: any[]; }) {
    var url = "https://localhost:44384/installationmapping";
    return fetch(url, {
        method: 'PUT',
        headers: new Headers({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }),
        body: JSON.stringify({
            "InstallationId": parseInt(mappingInputs.installationId),
            "TenantId": mappingInputs.tenantId,
            "SubscriptionIds": mappingInputs.subscriptionIds
        })
    }).then(responseJson => {
        return handleResponse(responseJson);
    }).catch(error => {
        throw error;
    });
}