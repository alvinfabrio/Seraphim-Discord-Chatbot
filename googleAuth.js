// const { google } = require('googleapis');
// const fs = require('fs');
// const path = require('path');

// let open;

// async function loadOpenModule() {
//     open = await import('open').then(module => module.default);
// }

// const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
// const TOKEN_PATH = 'token.json';
// let oauth2Client;

// // Load your credentials from environment variables
// async function authenticateGoogle() {
//     await loadOpenModule(); // Ensure 'open' is available before using it

//     const clientId = process.env.GOOGLE_CLIENT_ID;
//     const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
//     const redirectUri = process.env.GOOGLE_REDIRECT_URI;
//     const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

//     oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

//     // Use the refresh token if it's available in the environment variables
//     if (refreshToken) {
//         oauth2Client.setCredentials({ refresh_token: refreshToken });
//         console.log('Using refresh token from environment variables.');
//     } else if (fs.existsSync(TOKEN_PATH)) {
//         // Otherwise, check if a token is stored locally
//         const token = fs.readFileSync(TOKEN_PATH, 'utf8');
//         oauth2Client.setCredentials(JSON.parse(token));
//         console.log('Using stored token.');
//     } else {
//         // If no tokens exist, prompt user for authorization
//         const authUrl = oauth2Client.generateAuthUrl({
//             access_type: 'offline',
//             scope: SCOPES,
//         });
//         console.log('Authorize this app by visiting this url:', authUrl);

//         // Automatically open the URL in the default browser
//         await open(authUrl);
//     }
// }

// // Upload file to Google Drive
// async function uploadFileToDrive(fileName, filePath) {
//     const drive = google.drive({ version: 'v3', auth: oauth2Client });
//     const fileMetadata = {
//         name: fileName,
//     };
//     const media = {
//         mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//         body: fs.createReadStream(filePath),
//     };

//     const response = await drive.files.create({
//         resource: fileMetadata,
//         media: media,
//         fields: 'id',
//     });

//     const fileId = response.data.id;
//     const link = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
//     return link;
// }

// module.exports = { authenticateGoogle, uploadFileToDrive };

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


// const { google } = require('googleapis');
// const fs = require('fs');
// const path = require('path');

// let open;

// async function loadOpenModule() {
//     open = (await import('open')).default;
// }

// const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
// const TOKEN_PATH = 'token.json';
// let oauth2Client;

// async function authenticateGoogle() {
//     // Load the 'open' module early so it's ready when we need it
//     if (!open) {
//         await loadOpenModule();
//     }

//     const clientId = process.env.GOOGLE_CLIENT_ID;
//     const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
//     const redirectUri = process.env.GOOGLE_REDIRECT_URI;
//     const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

//     oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

//     // Use the refresh token if it's available in the environment variables
//     if (refreshToken) {
//         oauth2Client.setCredentials({ refresh_token: refreshToken });
//         console.log('Using refresh token from environment variables.');
//     } else if (fs.existsSync(TOKEN_PATH)) {
//         // Otherwise, check if a token is stored locally
//         const token = fs.readFileSync(TOKEN_PATH, 'utf8');
//         oauth2Client.setCredentials(JSON.parse(token));
//         console.log('Using stored token.');
//     } else {
//         // If no tokens exist, prompt user for authorization
//         const authUrl = oauth2Client.generateAuthUrl({
//             access_type: 'offline',
//             scope: SCOPES,
//         });
//         console.log('Authorize this app by visiting this url:', authUrl);

//         // Automatically open the URL in the default browser
//         await open(authUrl);
//     }
// }

// // Upload file to Google Drive
// async function uploadFileToDrive(fileName, filePath) {
//     const drive = google.drive({ version: 'v3', auth: oauth2Client });
//     const fileMetadata = {
//         name: fileName,
//     };
//     const media = {
//         mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//         body: fs.createReadStream(filePath),
//     };

//     const response = await drive.files.create({
//         resource: fileMetadata,
//         media: media,
//         fields: 'id',
//     });

//     const fileId = response.data.id;
//     const link = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
//     return link;
// }

// module.exports = { authenticateGoogle, uploadFileToDrive };

const { google } = require('googleapis');
const fs = require('fs');

// Google Drive API client
let drive;

// Authenticate using domain-wide delegation with a service account
async function authenticateGoogle() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        throw new Error('Environment variable GOOGLE_SERVICE_ACCOUNT_KEY is not set.');
    }

    const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    // Initialize the Google Auth client with impersonation
    const auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKey,
        scopes: ['https://www.googleapis.com/auth/drive'],
        clientOptions: {
            subject: 'alvinfabrio@fica.org', // Email of the user to impersonate
        },
    });

    // Create the Google Drive client
    drive = google.drive({ version: 'v3', auth });

    console.log('Authenticated using service account with domain-wide delegation.');
}

// Upload a file to Google Drive
async function uploadFileToDrive(fileName, filePath) {
    if (!drive) {
        throw new Error('Google Drive API not authenticated. Call authenticateGoogle() first.');
    }

    const fileMetadata = {
        name: fileName,
    };

    const media = {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
    });

    const fileId = response.data.id;
    const link = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    console.log(`File uploaded successfully. Link: ${link}`);
    return link;
}

module.exports = { authenticateGoogle, uploadFileToDrive };
