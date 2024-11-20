
// const { Client, GatewayIntentBits } = require('discord.js');
// const { OpenAI } = require("openai");
// const fs = require('fs');
// const path = require('path');
// const { authenticateGoogle, uploadFileToDrive } = require('./googleAuth.js');
// require("dotenv").config();

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// });

// // Discord Client
// const client = new Client({
//   intents: [
//         GatewayIntentBits.Guilds,
//         GatewayIntentBits.GuildMessages,
//         GatewayIntentBits.MessageContent
//     ]
// });

// const sleep = (ms) => {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// // When discord bot has started up
// client.once('ready', async () => {
//     console.log('Bot is ready!');
//     await authenticateGoogle();
// });

// const threadMap = {};

// const getOpenAiThreadId = (discordThreadId) => {
//     return threadMap[discordThreadId];
// }

// const addThreadToMap = (discordThreadId, openAiThreadId) => {
//     threadMap[discordThreadId] = openAiThreadId;
// }

// // Check if the API is done with the current request
// const statusCheckLoop = async (openAiThreadId, runId) => {
//     const run = await openai.beta.threads.runs.retrieve(openAiThreadId, runId);
//     if (!["cancelled", "failed", "completed", "expired"].includes(run.status)) {
//         await sleep(1000);
//         return statusCheckLoop(openAiThreadId, runId);
//     }
//     return run.status;
// };

// const addMessage = (threadId, content) => {
//     return openai.beta.threads.messages.create(
//         threadId,
//         { role: "user", content }
//     );
// }

// // Function to download file content from Code Interpreter response
// const downloadFileFromOpenAI = async (fileId, localPath) => {
//     const response = await openai.files.content(fileId);
//     const fileData = await response.arrayBuffer();
//     const buffer = Buffer.from(fileData);
//     fs.writeFileSync(localPath, buffer); // Save file locally
// }

// // This event will run every time a message is received
// client.on('messageCreate', async message => {
//     if (message.author.bot || !message.content || message.content === '') return;

//     const discordThreadId = message.channel.id;
//     let openAiThreadId = getOpenAiThreadId(discordThreadId);

//     let messagesLoaded = false;
//     if (!openAiThreadId) {
//         const thread = await openai.beta.threads.create();
//         openAiThreadId = thread.id;
//         addThreadToMap(discordThreadId, openAiThreadId);

//         if (message.channel.isThread()) {
//             const starterMsg = await message.channel.fetchStarterMessage();
//             const otherMessagesRaw = await message.channel.messages.fetch();
//             const otherMessages = Array.from(otherMessagesRaw.values())
//                 .map(msg => msg.content)
//                 .reverse(); //oldest first

//             const messages = [starterMsg.content, ...otherMessages]
//                 .filter(msg => !!msg && msg !== '');

//             await Promise.all(messages.map(msg => addMessage(openAiThreadId, msg)));
//             messagesLoaded = true;
//         }
//     }

//     if (!messagesLoaded) {
//         await addMessage(openAiThreadId, message.content);
//     }

//     if (message.content.toLowerCase().includes('create')) {
//         const run = await openai.beta.threads.runs.create(
//             openAiThreadId,
//             {
//                 assistant_id: process.env.ASSISTANT_ID,
//                 max_completion_tokens: 4000,
//                 tools: [
//                     { type: 'code_interpreter' }, // Code execution tool
//                     { type: 'file_search' } // File search tool
//                 ],
//                 tool_resources: {
//                     file_search: {
//                         vector_store_ids: [process.env.VECTOR_STORE_ID] // Specify vector store IDs here
//                     }
//                 }
//             }
//         );

//         const status = await statusCheckLoop(openAiThreadId, run.id);
//         const messages = await openai.beta.threads.messages.list(openAiThreadId);
//         const assistantMessage = messages.data[0];

//         // Extract file_id from either attachments or annotations
//         let fileId;
//         if (assistantMessage.attachments && assistantMessage.attachments.length > 0) {
//             fileId = assistantMessage.attachments[0].file_id; // From attachments
//         } else if (assistantMessage.content[0].text.annotations && assistantMessage.content[0].text.annotations.length > 0) {
//             fileId = assistantMessage.content[0].text.annotations[0].file_path.file_id; // From annotations
//         }

//         if (!fileId) {
//             message.reply("No file found in the response.");
//             return;
//         }

//         const fileName = `output_${Date.now()}.docx`;
//         const filePath = path.join(__dirname, fileName);

//         // Download the file using fileId
//         await downloadFileFromOpenAI(fileId, filePath);

//         // Upload to Google Drive and generate shareable link
//         const downloadLink = await uploadFileToDrive(fileName, filePath);

//         // Send the Google Drive link in Discord
//         await message.reply(`Your document is ready! You can download it here: ${downloadLink}`);

//         // Optionally, delete the local file after uploading
//         fs.unlinkSync(filePath);
//     } else {
//         const run = await openai.beta.threads.runs.create(
//             openAiThreadId,
//             {
//                 assistant_id: process.env.ASSISTANT_ID,
//                 max_completion_tokens: 4000,
//                 tools: [{ type: 'file_search' }],
//                 tool_resources: {
//                   file_search: {
//                     vector_store_ids: [process.env.VECTOR_STORE_ID]
//                   }
//                 },
//                 tool_choice: { type: 'file_search' }
//             }
//         );

//         const status = await statusCheckLoop(openAiThreadId, run.id);
//         const messages = await openai.beta.threads.messages.list(openAiThreadId);
//         let response = messages.data[0].content[0].text.value;
//         response = response.substring(0, 1999); // Discord message length limit

//         message.reply(response);
//     }
// });

// // Authenticate Discord
// client.login(process.env.DISCORD_TOKEN);

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
