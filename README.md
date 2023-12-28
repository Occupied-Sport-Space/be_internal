# OSS Backend REST API and Socket.IO README

## Overview

Welcome to the OSS Backend! This API serves as the backbone for the OSS system, handling RESTful requests and WebSocket communication via Socket.IO.

## Features

- **Real-Time Availability:** Receive and transmit real-time availability information for sports spaces.

- **RESTful Endpoints:** Access various endpoints for retrieving and managing sports space data, built on the Express framework.

- **Socket.IO Integration:** Enable real-time communication for dynamic updates and notifications.

## Getting Started

Follow these steps to set up and run the OSS Backend:

1. **Installation:** Clone this repository to your server.

   ```bash
   git clone https://github.com/Occupied-Sport-Space/be_internal
   ```

2. **Dependencies:** Install the necessary dependencies.

   ```bash
   npm install
   ```

3. **Configuration:**

   - Create a `.env` file in the root directory.
   - Add the following configurations:

     ```dotenv
     DATABASE_URL=your_database_url_here
     TOKEN_KEY=your_token_key_here
     ```

4. **Run the Server:** Start the Express server.

   ```bash
   npm run dev
   ```

5. **Check server status:** Go on localhost:8000, you should see the following:
    
    ```json
    {
        "message": "Welcome to the OSS API",
    }
    ```

## REST API Endpoints

Explore the various RESTful endpoints provided by the OSS Backend, built on the Express framework. Refer to the API documentation for detailed information on available routes and functionalities.

## Socket.IO Integration

The OSS Backend supports Socket.IO for real-time communication. Connect to the WebSocket server to receive dynamic updates and notifications. Refer to the Socket.IO documentation for details on usage and events.

## Contribution

We welcome contributions! If you have any improvements or feature suggestions, feel free to submit a pull request.

## License

This OSS Backend is licensed under the Non-Commercial Use License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

For any issues or inquiries, please contact our support team at support@[companyname].com.

Happy coding! 🚀🔧