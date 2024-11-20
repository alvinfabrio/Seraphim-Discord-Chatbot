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
const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const open = require('open'); // Open the authorization URL in the browser

const app = express();
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'token.json';

// Initialize OAuth2 client with clientId, clientSecret, and redirectUri
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Function to authenticate and obtain refresh token
async function authenticateGoogle() {
    // Check if we have the refresh token already
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (refreshToken) {
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        console.log('Using refresh token from environment variables.');
    } else {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        console.log('Authorize this app by visiting this URL:', authUrl);
        // Automatically open the URL in the default browser
        await open(authUrl);
    }
}

// OAuth2 callback route to receive the authorization code and get tokens
app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('Authorization code is missing');
    }

    try {
        // Exchange the authorization code for an access token and refresh token
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        
        // Save the refresh token to the environment variable or file
        process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;
        console.log('Refresh token saved:', tokens.refresh_token);

        // You may want to save the tokens to a file for later use
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

        res.send('Authentication successful! You can close this window.');
    } catch (error) {
        console.error('Error exchanging authorization code for tokens:', error);
        res.status(500).send('Failed to authenticate');
    }
});

// Function to upload a file to Google Drive
async function uploadFileToDrive(fileName, filePath) {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const fileMetadata = { name: fileName };
    const media = {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        body: fs.createReadStream(filePath),
    };

    try {
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        const fileId = response.data.id;
        const link = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
        return link;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file to Google Drive');
    }
}

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    authenticateGoogle();  // Start the OAuth flow
});
