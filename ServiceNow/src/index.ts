import '@k2oss/k2-broker-core';

const DebugTag = "=== htk === ";
const incidentPath = "/api/now/v1/table/incident";

metadata = {
    "systemName": "ImmersionUS_ServiceNow",
    "displayName": "ServiceNow Broker",
    "description": "Sample ServiceNow Broker.",
    "configuration": {
        "HostURL": {
            "displayName": "Host URL",
            "type": "string"
        }
    }
};

ondescribe = async function({configuration}): Promise<void> {
    postSchema({
        objects: {
            "Incident": {
                displayName: "Incident",
                description: "Manages ServiceNow Incidents",
                properties: {
                    "id": {
                        displayName: "System ID",
                        type: "string"
                    },
                    "incNum": {
                        displayName: "Incident Number",
                        type: "string"
                    },
                    "desc": {
                        displayName: "Description",
                        type: "extendedString"
                    },
                    "shortDesc": {
                        displayName: "Short Description",
                        type: "string"
                    },
                    "cat": {
                        displayName: "Category",
                        type: "string"
                    },
                    "subCat": {
                        displayName: "Sub Category",
                        type: "string"
                    },
                    "severity": {
                        displayName: "Severity",
                        type: "number"
                    },
                    "priority": {
                        displayName: "Priority",
                        type: "number"
                    },
                    "state": {
                        displayName: "Incident State",
                        type: "number"
                    },
                    "contactType": {
                        displayName: "Contact Type",
                        type: "string"
                    },
                    "closeCode": {
                        displayName: "Resolution Code",
                        type: "string"
                    },
                    "closeNote": {
                        displayName: "Close Notes",
                        type: "string"
                    },
                    "closeBy": {
                        displayName: "Close By",
                        type: "string"
                    },
                    "createdBy": {
                        displayName: "Created By",
                        type: "string"
                    },
                    "closedAt": {
                        displayName: "Close Datetime",
                        type: "string"
                    },
                    "openedAt": {
                        displayName: "Open Datetime",
                        type: "string"
                    } 
                },
                methods: {
                    "ListIncidents": {
                        displayName: "List incidents",
                        type: "list",
                        outputs: [ "id", "incNum", "desc", "shortDesc", "priority", "severity", "cat", "subCat", "contactType", "state", "closeCode", "closeNote", "createdBy","closedAt", "closeBy", "openedAt" ]
                    },
                    "GetIncident": {
                        displayName: "Get an incident",
                        type: "read",
                        inputs: [ "id" ],
                        requiredInputs: ["id"],
                        outputs: [ "id", "incNum", "desc", "shortDesc", "priority", "severity", "cat", "subCat", "contactType", "state", "closeCode", "closeNote", "createdBy","closedAt", "closeBy", "openedAt" ]
                    },
                    "CreateIncident": {
                        displayName: "Create new incident",
                        type: "create",
                        inputs: [ "priority", "desc", "shortDesc", "cat", "subCat", "severity", "contactType" ],
                        requiredInputs: [ "priority", "desc", "shortDesc", "cat", "subCat", "severity", "contactType" ],
                        outputs: [ "id" ]
                    },
                    "UpdateIncident": {
                        displayName: "Update an existing incident",
                        type: "update",
                        inputs: ["id", "closeNote", "state", "closeCode"],
                        requiredInputs: ["id", "closeNote", "state", "closeCode"],
                        outputs: [ "id" ]
                    }
                }
            }
        }
    });
}

onexecute = async function({objectName, methodName, parameters, properties, configuration, schema}): Promise<void> {
    switch (objectName)
    {
        case "Incident": await onexecuteIncident(methodName, properties, parameters, configuration); break;
        default: throw new Error("The object " + objectName + " is not supported.");
    }
}

async function onexecuteIncident(methodName: string, properties: SingleRecord, parameters: SingleRecord, configuration:SingleRecord): Promise<void> {
    switch (methodName)
    {
        case "ListIncidents": await onexecuteIncidentList(properties, configuration); break;
        case "GetIncident": await onexecuteIncidentGet(properties,configuration); break;
        case "CreateIncident": await onexecuteIncidentCreate(properties,configuration); break;
        case "UpdateIncident": await onexecuteIncidentUpdate(properties,configuration); break;
        default: throw new Error("The method " + methodName + " is not supported.");
    }
}

function onexecuteIncidentList(properties: SingleRecord, configuration:SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) =>
    {
        var incidentURL=configuration["HostURL"]+incidentPath;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            try {
                if (xhr.readyState !== 4) return;
                if (xhr.status !== 200) throw new Error("Failed with status " + xhr.status);
                //console.log(`${DebugTag}`+"completed Rest API");
                var obj = JSON.parse(xhr.responseText);
                //console.log(`${DebugTag}`+"=== ServiceNow === response "+xhr.responseText)

                postResult(obj.result.map(x => {
                  return {
                    "id": x.sys_id,
                    "incNum": x.number,
                    "desc": x.description,
                    "shortDesc": x.short_description,
                    "cat": x.category,
                    "subCat": x.subcategory,
                    "severity": x.severity,
                    "priority": x.priority,
                    "state": x.state,
                    "contactType": x.contact_type,
                    "closeCode": x.close_code,
                    "closeNote": x.close_notes,
                    "createdBy": x.createdBy,
                    "closedAt": x.closed_at,
                    "openedAt": x.opened_at
                  }}
                ));
                resolve();
            } catch (e) {
                reject(e);
            }
        };
        
        xhr.withCredentials = true; /* use static authentication */
        var url=incidentURL;
        //console.log(`${DebugTag}`+"=== ServiceNow === URL is ["+url+"]");
        xhr.open("Get", url);
        
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.send();
    });
}

function onexecuteIncidentGet(properties: SingleRecord, configuration:SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) =>
    {
        var incidentURL=configuration["HostURL"]+incidentPath;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            try {
                if (xhr.readyState !== 4) return;
                if (xhr.status !== 200) throw new Error("Failed with status " + xhr.status);
                //console.log(`${DebugTag}`+"completed Rest API");
                var obj = JSON.parse(xhr.responseText);
                //console.log(`${DebugTag}`+"=== ServiceNow === Incident Number is "+obj.result.number)
                //console.log(`${DebugTag}`+"=== ServiceNow === Incident sys_id is "+obj.result.sys_id)
                postResult({
                    "id": obj.result.sys_id,
                    "incNum": obj.result.number,
                    "desc": obj.result.description,
                    "shortDesc": obj.result.short_description,
                    "cat": obj.result.category,
                    "subCat": obj.result.subcategory,
                    "severity": obj.result.severity,
                    "priority": obj.result.priority,
                    "state": obj.result.state,
                    "contactType": obj.result.contact_type,
                    "closeCode": obj.result.close_code,
                    "closeNote": obj.result.close_notes,
                    "createdBy": obj.result.createdBy,
                    "closedAt": obj.result.closed_at,
                    "openedAt": obj.result.opened_at
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        };
        
        xhr.withCredentials = true;
        var url=incidentURL + "/" + properties["id"];
        //console.log(`${DebugTag}`+"=== ServiceNow === URL is ["+url+"]");

        xhr.open("Get", url);
        
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.send();
    });
}

function onexecuteIncidentCreate(properties: SingleRecord, configuration:SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) =>
    {
        var incidentURL=configuration["HostURL"]+incidentPath;
        var xhr = new XMLHttpRequest();
        var data = JSON.stringify({
                "priority": properties["priority"],
                "description": properties["desc"],
                "short_description": properties["shortDesc"],
                "category": properties["cat"],
                "subcategory": properties["subCat"],
                "severity":properties["severity"],
                "contact_type": properties["contactType"]
        });

        xhr.onreadystatechange = function() {
            try {
                if (xhr.readyState !== 4) return;
                if ((xhr.status !== 200) && (xhr.status != 201)) throw new Error("Failed with status " + xhr.status);
                //console.log(`${DebugTag}`+"completed Rest API");
                var obj = JSON.parse(xhr.responseText);
                //console.log(`${DebugTag}`+"=== ServiceNow === Incident Number is "+obj.result.number)
                //console.log(`${DebugTag}`+"=== ServiceNow === Incident sys_id is "+obj.result.sys_id)
                postResult({
                    "id": obj.result.sys_id,
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        };
        
        xhr.withCredentials = true;
        xhr.open("POST", incidentURL);
        //console.log(`${DebugTag}`+"=== ServiceNow === URL is ["+incidentURL);
        //xhr.setRequestHeader('Authorization', staticAuthStr);
        xhr.setRequestHeader("Content-Type", "application/json");
        //console.log(`${DebugTag}`+"=== ServiceNow === Data [" + data +"]");
        xhr.send(data);

    });
}

function onexecuteIncidentUpdate(properties: SingleRecord, configuration:SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) =>
    {
        var incidentURL=configuration["HostURL"]+incidentPath;
        var xhr = new XMLHttpRequest();
        var data = JSON.stringify({
            "close_notes":properties["closeNote"],
            "incident_state":properties["state"],
            "close_code": properties["closeCode"]
        });


        xhr.onreadystatechange = function() {
            try {
                if (xhr.readyState !== 4) return;
                if ((xhr.status !== 200) && (xhr.status != 201)) throw new Error("Failed with status " + xhr.status);
                //console.log(`${DebugTag}`+"completed Rest API");
                var obj = JSON.parse(xhr.responseText);
                //console.log(`${DebugTag}`+"=== ServiceNow === response "+xhr.responseText)
                //console.log(`${DebugTag}`+"=== ServiceNow === Incident sys_id is "+obj.result.sys_id)
                postResult({
                    "id": obj.result.sys_id,
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        };
        
        xhr.withCredentials = true;
        var url = incidentURL+'/' + properties["id"];
        //console.log(`${DebugTag}`+"=== ServiceNow === URL is ["+url+"]");
        xhr.open("PATCH", url);

        //xhr.setRequestHeader('Authorization', staticAuthStr);
        xhr.setRequestHeader("Content-Type", "application/json");

        //console.log(`${DebugTag}`+"=== ServiceNow === Data [" + data +"]");
        xhr.send(data);

    });
}