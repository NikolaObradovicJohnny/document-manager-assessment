# Propylon Document Manager Assessment

The Propylon Document Management Technical Assessment is a simple (and incomplete) web application consisting of a basic API backend and a React based client.  This API/client can be used as a bootstrap to implement the specific features requested in the assessment description. 

## Getting Started
### API Development
The API project is a [Django/DRF](https://www.django-rest-framework.org/) project that utilizes a [Makefile](https://www.gnu.org/software/make/manual/make.html) for a convenient interface to access development utilities. This application uses [SQLite](https://www.sqlite.org/index.html) as the default persistence database you are more than welcome to change this. This project requires Python 3.11 in order to create the virtual environment.  You will need to ensure that this version of Python is installed on your OS before building the virtual environment.  Running the below commmands should get the development environment running using the Django development server.
1. `$ make build` to create the virtual environment.
2. `$ make fixtures` to create a small number of fixture file versions.
3. `$ make serve` to start the development server on port 8001.
4. `$ make superuser` to register test user. You should add SUPERUSER_EMAIL and SUPERUSER_PASSWORD in .env file in **settings** folder inside Django project. (path: src\propylon_document_manager\site\settings)
5. `$ make populate-file-hash` to populate file hash for all documents where file hash is not defined.
6. `$ make test` to run the limited test suite via PyTest.
7. `$ make test-api` to run the API tests.
### Client Development 
The client project is a [Create React App](https://create-react-app.dev/) that has been tested against [Node v18.19.0 Hydrogen LTS](https://nodejs.org/download/release/v18.19.0/).  An [.nvmrc](https://github.com/nvm-sh/nvm#calling-nvm-use-automatically-in-a-directory-with-a-nvmrc-file) file has been included so that the command `$ nvm use` should select the correct NodeJS version through NVM.
1. Navigate to the client/doc-manager directory.
2. `$ npm install` to install the dependencies.
3. `$ npm start` to start the React development server.

##
[![Built with Cookiecutter Django](https://img.shields.io/badge/built%20with-Cookiecutter%20Django-ff69b4.svg?logo=cookiecutter)](https://github.com/cookiecutter/cookiecutter-django/)

## API Documentation

This is a document management application that allows users to upload documents, retrieve specific versions of those documents, and manage file paths. Users authenticate with an API token and can access, upload, and update files.

## Features
- **Authentication**: Login to get a token.
- **Document Upload**: Upload documents and get a URL.
- **Versioning**: Retrieve document versions and upload new versions.
- **File Hashing**: Use content addressable storage with file hashes.
- **Custom File Paths**: Specify file paths for document storage.

## Installation
Clone the repository.
Create a `.env` file for environment variables and save in /settings/ folder:


### .env content for Django/backend:

You should add SUPERUSER_EMAIL and SUPERUSER_PASSWORD in .env file in **settings** folder inside Django project. (path: src\propylon_document_manager\site\settings)

```bash
SUPERUSER_EMAIL=admin@admin.com
SUPERUSER_PASSWORD=admin1234
```

### .env content for React/frontend:

You should add this in .env file in **root** folder inside React project. (path: client\doc-manager)

```bash
REACT_APP_BASE_URL=http://localhost:8001
```

## Authentication
To authenticate with the API, you need to provide a `Token <token>` in the headers for each request. The token is generated upon login and must be passed with the `Authorization` header.

### Example:
```bash
Authorization: Token <your_token>
```
## Endpoints

### 1. Login

**POST** `/api/login/`

Authenticate and get a token.

**Request body:**
```bash
{
  "email": "your_email@example.com",
  "password": "your_password"
}
```
**Response:**
```bash
{
  "token": "your_token"
  "user": "your_email"
}
```

### 2. Upload a Document

**POST** `/api/documents/upload-document/`

Upload a new file. The file is attached as form-data.

**Request:** multipart/form-data
```bash
file: file (file)
file_name: "Document 1" (text)
```
**Response:**
```bash
{
    file_name:"Document 1",
    file_owner:1,
    version_number:4,
    file:"/media/documents/2bb5655a7d4b6e2321a76d4b11efe8b42187f217161637fa9f97d59875375f97_DgXKNJ2.pdf",
    file_hash:"2bb5655a7d4b6e2321a76d4b11efe8b42187f217161637fa9f97d59875375f97",
    uploaded_at:"2025-03-11T19:44:22.942838Z"
}
```

### 3. Get Document by Hash
**GET** `/api/files/<file_hash>/`

Retrieve a file by its unique hash.

**Example:**
```bash
GET /api/files/20a9018682ba89ddd49f37ab80833b5ce5cab72b816b90215cfb570cebdb2092/
```

**Response:**
- Returns the file as a binary stream.

### 4. Get All Versions of a Document
**GET** `/api/documents/<file_name>/all/`

Retrieve all versions of a document by its name.

**Example:**
```bash
GET /api/documents/review/all/
```

**Response:**
```bash
[
    {
        "file_name":"review",
        "file_owner":1,
        "version_number":6,
        "file":"/media/documents/379a3a988dcc0ed452a1dad87971e25ee12caa70e7844194115bc11db3d8b1ab.png",
        "file_hash":"379a3a988dcc0ed452a1dad87971e25ee12caa70e7844194115bc11db3d8b1ab",
        "uploaded_at":"2025-03-10T22:18:56.164209Z"
    },
    {
        "file_name":"review",
        "file_owner":1,
        "version_number":5,
        "file":"/media/documents/ed83683f4cd47734d6b1ed1ecf792462453ce07b9daf9c8e5cc240b6a3123dbd.png",
        "file_hash":"ed83683f4cd47734d6b1ed1ecf792462453ce07b9daf9c8e5cc240b6a3123dbd",
        "uploaded_at":"2025-03-10T22:15:27.754496Z"
    },
    ...
]
```


### 5. Get Latest or Specific Version of a Document
**GET** `/api/documents/<filename>?version=<version_number>`

Retrieve latest or specific version of a document if version is provided as a query parameter.

**Example:**
```bash
GET /api/documents/review?version=2
```
**Response:**
Returns the file for the specified version.

```bash
{
    file_name:"review",
    file_owner:1,
    version_number:2,
    file:"/media/documents/46ca8fe777d26ca53dc83a0c770f39b3246603e45292368c3f3e05398af2c100.jpg",
    file_hash:"46ca8fe777d26ca53dc83a0c770f39b3246603e45292368c3f3e05398af2c100",
    uploaded_at:"2025-03-10T18:05:24.019715Z"
}
```

### 6. Get Latest File Versions
```bash
GET /api/file_versions/
```

**Description**
Returns the latest version of all files uploaded by the authenticated user.

#### Authentication Required
Token Authentication (TokenAuthentication)
Session Authentication (SessionAuthentication)
User must be authenticated and own the files.

#### Permissions
Only the file owner can access their file versions.
Unauthorized users will receive a 403 Forbidden error.

**Request**

**GET** /api/file_versions/

header:
```bash
Authorization: Token <your_auth_token>
```
**Response**
```bash
[
    {
        file_name:"Document 1",
        file_owner:1,
        version_number:1,
        file:"http://localhost:8001/media/documents/20a9018682ba89ddd49f37ab80833b5ce5cab72b816b90215cfb570cebdb2092.png",
        file_hash:"20a9018682ba89ddd49f37ab80833b5ce5cab72b816b90215cfb570cebdb2092",
        uploaded_at:"2025-03-11T14:02:23.880032Z"
    },
    {
        file_name:"Document 2",
        file_owner:1,
        version_number:4,
        file:"http://localhost:8001/media/documents/2bb5655a7d4b6e2321a76d4b11efe8b42187f217161637fa9f97d59875375f97_DgXKNJ2.pdf",
        file_hash:"2bb5655a7d4b6e2321a76d4b11efe8b42187f217161637fa9f97d59875375f97",
        uploaded_at:"2025-03-11T19:44:22.942838Z"
    }
    ...
]
```

**Error Responses**

|Status|Code|Message|
| ------------ | ------------ | ------------ |
|403|Forbidden|User is not authenticated or does not own the requested file.|
|401|Unauthorized|Token is missing or invalid.|

