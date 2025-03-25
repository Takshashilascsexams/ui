import axios from "axios";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";

// Create an axios instance with keep-alive configuration
const axiosInstance = axios.create({
  httpAgent: new HttpAgent({
    keepAlive: true,
    timeout: 60000, // 60s timeout
    maxSockets: 10, // Limit concurrent connections
  }),
  httpsAgent: new HttpsAgent({
    keepAlive: true,
    timeout: 60000, // 60s timeout
    maxSockets: 10, // Limit concurrent connections
  }),
});

export default axiosInstance;
