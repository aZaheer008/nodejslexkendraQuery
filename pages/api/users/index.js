var AWS = require('aws-sdk');
// Load the AWS SDK v3
const { LexRuntimeV2Client, RecognizeTextCommand } = require("@aws-sdk/client-lex-runtime-v2");
const { KendraClient, QueryCommand } = require("@aws-sdk/client-kendra");

// Set the region for the SDK

let configuration = { region: "us-east-1" ,
credentials: new AWS.Credentials({
  accessKeyId: "accessKeyId",         // Add your access IAM accessKeyId
  secretAccessKey: "secretAccessKey"    // Add your access IAM secretAccessKey
})};
const client = new LexRuntimeV2Client(configuration);
import { usersRepo } from 'helpers';

export default handler;

function handler(req, res) {
    switch (req.method) {
        case 'GET':
            return getUsers();
        case 'POST':
            return createUser();
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    function getUsers() {
        const users = usersRepo.getAll();
        return res.status(200).json(users);
    }
    
    function createUser() {
        try {
            console.log("---req.body-----",req.body);
            let textToQuery = req.body;
            // Set up the query parameters
            const params = {
                botId: 'botId',
                botAliasId: 'botAliasId',
                localeId: 'en_US',
                sessionId: 'YOUR_SESSION_ID',
                text: textToQuery,
            };
  
            // Create the RecognizeText command
            const command = new RecognizeTextCommand(params);
            // Call the RecognizeText API
            client.send(command).then((response) => {
                console.log("----Response----- : ",response.messages);
                if (response.messages && response.messages.length){
                    let responsetosend = {
                        'ResultItems' : response.messages,
                        'lex' : true
                    };
                    return res.status(200).json(responsetosend);
                } else {
                    console.log("----kendra query---");
                    const kendraclient = new KendraClient(configuration);
                    const params = {
                        IndexId: "c0db2140-342c-4717-a89a-92ac4cd076ae",
                        QueryText: textToQuery,
                    };
                    
                    // Create the query command
                    const command = new QueryCommand(params);
                    // Call the query API
                    kendraclient.send(command).then((response) => {
                        console.log("----24----",response);
                        if (response && response.ResultItems && response.ResultItems.length){
                            ResultItems = response.ResultItems;
                            let responsetosend = {
                                ResultItems,
                                'kendra' : true
                            };
                            return res.status(200).json(responsetosend);
                        } else {
                            let responsetosend = {
                                'notFound':`Can't find an answer to that Query`,
                            }
                            return res.status(200).json(responsetosend);
                        }
                    }).catch((error) => {
                        console.error(error);
                    });
                }
            }).catch((error) => {
                console.error("---28---",error);
            });
            // usersRepo.create(req.body);
            // return res.status(200).json({});
        } catch (error) {
            return res.status(400).json({ message: error });
        }
    }
}
