const AWS = require('aws-sdk');

AWS.config.update({ region: 'ap-southeast-1' });
AWS.config.setPromisesDependency(null);

let params = {

    TableName: 'FB_BOT_USER_DETAILS',
    KeyConditionExpression: 'pageid = :pid and userid = :uid',
    ExpressionAttributeValues: {
        ':pid': '64662373784',
        ':uid': '1795413400502679'
    }
};

const dyndb = new AWS.DynamoDB.DocumentClient();

async function caller()
{
    let userinfo = await userdata()

    console.log(userinfo);
}

async function userdata()
{
    retval = await dyndb.query(params).promise();

    return retval;
}

caller();