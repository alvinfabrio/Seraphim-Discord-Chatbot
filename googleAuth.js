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
const { JWT } = require('google-auth-library');

// This assumes you have the Base64-encoded service account JSON in an environment variable
const serviceAccountKey = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8'));

// Create the JWT client using the service account credentials
const auth = new JWT({
    email: serviceAccountKey.client_email,
    key: serviceAccountKey.private_key,
    scopes: ['https://www.googleapis.com/auth/drive'],  // Required scope for Drive access
});

// Create the Google Drive client with the authenticated JWT
const drive = google.drive({ version: 'v3', auth });

async function uploadFileToDrive(fileName, filePath) {
    const fileMetadata = {
        name: fileName,
    };

    const media = {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        body: fs.createReadStream(filePath),
    };

    // Upload the file to Google Drive
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

// Example: Upload a file
uploadFileToDrive('test-file.docx', './path/to/file.docx');
