# GoogleMap-Basic

A web application that integrates Google Maps with markers, user authentication (including GitHub and Google OAuth), and a MongoDB backend using the MongoDB Data API.

## Features

- Display Google Maps with the ability to add markers.
- User registration and login.
- OAuth login with GitHub and Google.
- Store markers and user information in MongoDB via the Data API.
- Secure marker addition with JWT authentication.

## Getting Started

### Prerequisites

- Node.js
- MongoDB Atlas account
- Google Cloud Platform account
- GitHub account

### Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/sacred-g/GoogleMap-Basic.git
    cd GoogleMap-Basic
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Create a `.env` file**:

    Create a `.env` file in the root of your project directory and add the following content:

    ```plaintext
    MONGO_API_KEY=your_mongo_api_key
    JWT_SECRET=your_jwt_secret_key
    GITHUB_CLIENT_ID=your_github_client_id
    GITHUB_CLIENT_SECRET=your_github_client_secret
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    ```

    Replace the placeholder values with your actual API keys and secrets.

4. **Set up Google OAuth**:

    - Go to the [Google Cloud Console](https://console.cloud.google.com/).
    - Create a new project or select an existing project.
    - Navigate to the **APIs & Services** dashboard and create OAuth 2.0 Client IDs.
    - Set the redirect URI to `http://localhost:3000/auth/google/callback`.
    - Add the Client ID and Client Secret to your `.env` file.

5. **Set up GitHub OAuth**:

    - Go to [GitHub Developer Settings](https://github.com/settings/developers).
    - Register a new OAuth application.
    - Set the callback URL to `http://localhost:3000/auth/github/callback`.
    - Add the Client ID and Client Secret to your `.env` file.

6. **Start the server**:

    ```bash
    cd server
    node server.js
    ```

7. **Run the application**:

    Open your browser and navigate to `http://localhost:3000/login.html` to see the login page. You can register or log in using the forms or authenticate with GitHub or Google.

## Folder Structure

GoogleMap-Basic/
│
├── server/
│ ├── models/
│ │ ├── marker.js
│ │ └── user.js
│ └── server.js
├── public/
│ ├── index.html
│ ├── login.html
│ ├── register.html
│ ├── styles.css
│ └── script.js
├── .env
├── .gitignore
├── package.json
└── README.md




## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Steps to install
Install Dependencies:
Ensure you have installed all the required dependencies by running:


npm install
Start the Server:
Ensure you have the .env file in the root directory.
Start the server:


cd server
node server.js
Open the Application:

Open your browser and navigate to http://localhost:3000/login.html to see the login page.
Register or log in using the forms.
Alternatively, log in using GitHub or Google.