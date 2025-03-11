const BASE_URL = "http://localhost:8001/";
const API_BASE_URL = `${BASE_URL}api/`;

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  "Authorization": `Token ${getToken()}`,
});

// Generic GET request
export const get = async (endpoint) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: headers(),
  });
  return response.json();
};

// Generic POST request
export const post = async (endpoint, data, isFormData = false) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: isFormData ? headers() : { "Content-Type": "application/json", ...headers() },
    body: isFormData ? data : JSON.stringify(data),
  });
  return response.json();
};

export const postBaseUrl = async (endpoint, data) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  };

// Function to login and store token
export const login = async (email, password) => {
  const response = await postBaseUrl("auth-token/", { email, password });
  if (response.token) {
    localStorage.setItem("token", response.token);
  }
  return response;
};

// Function to get all file versions
export const getFileVersions = async () => {
  return get("file_versions/");
};

// Function to get all versions of a specific file
export const getFileVersionsByName = async (filename) => {
  return get(`documents/${filename}/all`);
};

// Function to upload a file
export const uploadFile = async (file, fileName) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("file_name", fileName);

  return post("upload-document/", formData, true);
};

// Function to logout
export const logout = () => {
  localStorage.removeItem("token");
};
