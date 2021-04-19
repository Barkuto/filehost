# filehost
Small File Host Server with API

Upload files, and get back a url.

# Endpoints
`/api/upload`

Request Body(as JSON):
```
{
    API_KEY: "api key that matches with the server",
    base64: "file data encoded as base64 string",
    ext: "file extension without period(.)"
}
```

# Environment Variables
API_KEY: Key to be allowed to upload to the server.

PORT: Port for server to be run on

OVERRIDE_URL: Base Url that will be used after uploading a file

# Dev
## Run
```
npm install

API_KEY=<api_key> PORT=<port> npm start
```