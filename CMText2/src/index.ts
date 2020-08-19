import '@k2oss/k2-broker-core';
const DebugTag = "=== USTS-ICM: ";

metadata = {
    systemName: "ImmersionAzureContentModeration",
    displayName: "Azure Content Moderation",
    description: "Content Moderation on Azure Process Text.",
    "configuration": {
        "apiKey": {
            "displayName": "Subscription Key",
            "type": "string"
        }
    }
};

ondescribe = async function({configuration}): Promise<void> {
    postSchema({
        objects: {
            "ModerateText": {
                displayName: "ModerateText",
                description: "ModerateText",
                properties: {
                    "inputText": {
                        displayName: "Input Text",
                        type: "string"
                    },
                    "debug": {
                        displayName: "debug",
                        type: "string"
                    },
                    "class1Score": {
                        displayName: "Class 1 Score",
                        type: "string"
                    },
                    "class2Score": {
                        displayName: "Class 2 Score",
                        type: "string"
                    },
                    "class3Score": {
                        displayName: "Class 3 Score",
                        type: "string"
                    },
                    "piiEmails": {
                        displayName: "PII Emails",
                        type: "string"
                    },
                    "piiSSNs": {
                        displayName: "PII SSNs",
                        type: "string"
                    },

                    "language": {
                        displayName: "Title",
                        type: "string"
                    },
                    "reviewNeeded": {
                        displayName: "Review Needed",
                        type: "boolean"
                    }
                },
                methods: {
                    "AnalyzeText": {
                        displayName: "AnalyzeText",
                        type: "read",
                        inputs: [ "inputText" ],
                        requiredInputs: ['inputText'],
                        outputs: [ "debug", "language", "reviewNeeded", "class1Score", "class2Score", "class3Score", "piiEmails", "piiSSNs" ]
                    }
                }
            }
        }
    });
}


onexecute = async function({objectName, methodName, parameters, properties, configuration, schema}): Promise<void> {
    switch (objectName)
    {
        case "ModerateText": await onexecuteModerateText(methodName, properties, parameters, configuration); break;
        default: throw new Error("The object " + objectName + " is not supported.");
    }
}

async function onexecuteModerateText(methodName: string, properties: SingleRecord, parameters: SingleRecord, configuration:SingleRecord): Promise<void> {
    switch (methodName)
    {
        case "AnalyzeText": await onexecuteAnalyzeText(parameters, properties, configuration); break;
        default: throw new Error("The method " + methodName + " is not supported.");
    }
}

function onexecuteAnalyzeText(parameters: SingleRecord, properties: SingleRecord, configuration:SingleRecord): Promise<void> {
    return new Promise<void>((resolve, reject) =>
    {
        var xhr = new XMLHttpRequest();

        console.log(DebugTag+"onexecuteAnalyzeText");

        xhr.onreadystatechange = function() {
            try {
                if (xhr.readyState !== 4) return;
                if (xhr.status !== 200) throw new Error("Failed with status " + xhr.status);

                var obj = JSON.parse(xhr.responseText);

                // Get PII Email List
                var emails=null;
                var emailList = '';

                if (obj.PII && (emails=obj.PII.Email)) {
                    //var length = Object.keys(emails).length;
                    var emailList = '';
                    for (var key in emails) {
                        console.log(`${DebugTag}Email Detected ====>${emails[key].Detected}`);
                        //console.log('Email type ====>' + emails[key].SubType);
                        //console.log('Index ====>' + emails[key].Index);
                        //console.log (' ++++ email length', emaillist.length);
                        if (emailList.length > 0)
                            emailList = emailList + ','+emails[key].Detected;
                        else
                            emailList = emails[key].Detected;               
                    }
                    console.log(DebugTag+" Email List "+ emailList);
                }

                //Get PII SSN
                var ssns=null;
                var ssnList='';
                if (obj.PII && (ssns=obj.PII.SSN)) {
                    for (var key in ssns) {
                        console.log(`${DebugTag}SSN Detected ====>${ssns[key].Text}`);
                        if (ssnList.length > 0)
                            ssnList = ssnList + ','+ssns[key].Text;
                        else
                            ssnList = ssns[key].Text;               

                    console.log(`${DebugTag}SSN Detected ====>${ssns[key].Text}`);
                    }
                }
      
  

                postResult({
                    "debug": "Add PII SSN",
                    "language": obj.Language,
                    "reviewNeeded": obj.Classification.ReviewRecommended,
                    "class1Score": obj.Classification.Category1.Score,
                    "class2Score":obj.Classification.Category2.Score,
                    "class3Score":obj.Classification.Category3.Score,
                    "piiEmails": emailList,
                    "piiSSNs": ssnList
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        };

        var url = "https://eastus.api.cognitive.microsoft.com/contentmoderator/moderate/v1.0/ProcessText/Screen?autocorrect=true&PII=true&classify=true"

        xhr.open("POST", url);

        xhr.setRequestHeader('Content-Type', 'text/plain');
        xhr.setRequestHeader("Ocp-Apim-Subscription-Key", String(configuration["apiKey"]));
        xhr.send(String(properties['inputText']));
    });
}

