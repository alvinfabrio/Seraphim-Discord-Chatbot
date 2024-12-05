
const { google } = require('googleapis');
const fs = require('fs');

// Google Drive API client
let drive;

// Authenticate using the service account (no impersonation needed)
async function authenticateGoogle() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        throw new Error('Environment variable GOOGLE_SERVICE_ACCOUNT_KEY is not set.');
    }

    // Decode the Base64-encoded service account key from the environment variable
    const serviceAccountKey = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8'));

    // Initialize the Google Auth client
    const auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKey,
        scopes: ['https://www.googleapis.com/auth/drive'], // Required scope for Drive access
    });

    // Create the Google Drive client with the authenticated credentials
    drive = google.drive({ version: 'v3', auth });

    console.log('Authenticated using service account.');
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

    // Upload the file
    const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
    });

    const fileId = response.data.id;

    // Set sharing permissions (make the file accessible to anyone with the link)
    await drive.permissions.create({
        fileId: fileId,
        requestBody: {
            role: 'writer', 
            type: 'anyone',
        },
    });

    // Generate the shareable link
    const link = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    console.log(`File uploaded and shared successfully. Link: ${link}`);
    return link;
}

module.exports = { authenticateGoogle, uploadFileToDrive };
