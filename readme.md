# Document-AI

Document-AI is an AI-powered tool for generating invoices and contracts with voice command support. It simplifies document creation and customization, enabling users to manage professional documents efficiently.

## Features

- **Voice Command Integration**: Use voice input to generate and manage invoices and contracts.
- **AI-Powered Document Generation**: Leverage advanced AI for automated, customizable invoice and contract creation.
- **Rich Text Editing**: Integrated with `@uiw/react-md-editor` for seamless document formatting.
- **Real-Time Collaboration**: Firebase integration enables shared access and editing.
- **Visualizations**: Use Recharts for insightful data visualizations.
- **Robust Error Handling**: Sentry integration for monitoring and managing application errors.
- **Tailored UI/UX**: Built with React and TailwindCSS for a modern, responsive interface.

## Tech Stack

- **Frontend**: React, React Router, TailwindCSS
- **Backend**: Firebase for authentication, database, and storage
- **AI Integration**: Google Generative AI API for document creation
- **Editor**: Markdown editor from `@uiw/react-md-editor`
- **Testing**: Vitest for unit and integration testing
- **Error Tracking**: Sentry for real-time error reporting

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/document-ai.git
   cd document-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the project root with your configuration details:
   ```env
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-firebase-app-id
   VITE_GOOGLE_API_KEY=your-google-api-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Previews the production build.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run test`: Runs the tests using Vitest.

## Usage

1. **Voice Commands**:
   Use the built-in microphone support to issue commands for generating and customizing invoices or contracts.

2. **AI Document Generation**:
   Specify details through the user interface or voice commands, and let the AI generate the required document.

3. **Customization**:
   Edit documents directly using the markdown editor.

4. **Save and Export**:
   Save documents to Firebase or export them as PDF/Word files.


## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
