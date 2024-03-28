# FlexTube
Example of microservices system from Book "Bootstrapping Microservices"

Origin GitHub repositories: https://github.com/bootstrapping-microservices-2nd-edition

## Overview

FlexTube is a video streaming service, allowing users to upload, view, and stream videos. This project is designed to run in Docker containers, leveraging nodemon for live reload during development, and integrates with AWS S3 for video storage.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Docker
- Docker Compose
- Node.js
- An AWS account with access to S3

### Installation

1. Clone the FlexTube repository to your local machine.
2. Navigate to the FlexTube project directory.
3. Copy the `.env.example` file to `.env` and fill in your AWS S3 credentials and other environment variables as needed.
4. Run `docker-compose up --build` to build and start the containers.

## Development

### Live Reload with Nodemon

Nodemon is used in our development environment to automatically restart the node application when file changes in the directory are detected. This is essential for improving the development experience by not having to manually restart the server on each code change.

To enable live reload, nodemon is included in the Docker container for the video-streaming service. The `docker-compose.yml` file is configured to mount your project directory into the container, allowing nodemon to watch for file changes.

### Docker Compose

The `docker-compose.yml` file is set up to define the services required for the application, including the video-streaming service and any databases or additional services like Redis or MongoDB if needed. It ensures that all services are networked together and can communicate with each other and with AWS S3.

### AWS S3 Integration

AWS S3 is used for video storage. The integration is managed through environment variables that store AWS credentials and bucket information. Ensure you have the correct permissions set up in AWS IAM and that your `.env` file contains the correct AWS S3 bucket name and credentials.

The video-storage service handles the upload, retrieval, and deletion of video files from AWS S3. The AWS SDK for JavaScript is used to interact with S3.

## Usage

After starting the services with Docker Compose, the application will be accessible at `http://localhost:<PORT>`, where `<PORT>` is the port specified in your `.env` file for the video-streaming service.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Node.js community
- Docker community
- AWS S3 documentation
