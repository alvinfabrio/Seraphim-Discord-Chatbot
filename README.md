# Seraphim

In this repo we integrate Discord.js with the new OpenAI Assistants API. The bot operates within Discord channels, listening to messages and using OpenAI to generate responses.

## Video Guide
OpenAI Assistant Initialization:
https://youtu.be/5TU_wOC0dmw

Google Drive API Initialization
https://www.youtube.com/watch?v=1y0-IfRW114&t=759s
## Features

- **Discord Integration**: The bot listens to messages in Discord channels.
- **OpenAI Response Generation**: Leverages the new OpenAI Assistants API to create responses to messages.
- **Message Thread Tracking**: Maintains message threads for continuity in conversations.
- **NEW Assistants Capabilities**: Since the bot uses Assistants, you no longer have to worry about context management and you can also benefit from assistant capabilities such as `code interpreter` and knowledge `retrieval`

## Prerequisites

- Node.js installed on your machine.
- A Discord bot token (from Discord Developer Portal).
- An OpenAI API key
- Refer to .env for more detailed requirements

## Installation

1. **Clone the Repository**:
   ```
   git clone [repository-url]
   ```
2. **Navigate to the Repository Folder**:
   ```
   cd Seraphim-Discord-Chatbot
   ```
3. **Install Dependencies**:
   ```
   npm install
   ```

## Configuration

1. **Set Up Environment Variables**:
   Create a `.env` file in the root of your project with the following variables:
   mv .env.sample .env 
   ```
   DISCORD_TOKEN=your_discord_bot_token
   OPENAI_API_KEY=your_openai_api_key
   ASSISTANT_ID=your_openai_assistant_id
   VECTORE_STORE_ID=your_file_vector_store_id
   
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URIS=your_google_client_uris
   GOOGLE_REFRESH_TOKEN=your_google_client_refresh_token
   ```

## Running the Bot

1. **Start the Bot**:
   ```
   npm install nodemon
   ```
   AND THEN
   ```
   nodemon bot.js
   ```

## Usage

- **Interaction**: Simply type and send messages in your Discord server where the bot is added. The bot will automatically generate and send replies based on the OpenAI model's output.
- **Discord Channels**: Works in any text channel or thread where the bot has permissions to read and send messages.
- **Document Generation: Simply add in the keyword "create" in your message followd by the document and its specification (E.g. recipient name, date, role, etc)
- **E.g. "Please create a volunter letter for John Doe where he will be joining the IT department starting from the 7th of October"

## Contributing

Feel free to fork the repository and submit pull requests.

## License

MIT
