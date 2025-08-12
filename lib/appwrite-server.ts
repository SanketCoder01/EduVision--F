import { Client, Databases, ID } from 'node-appwrite'

const endpoint = process.env.APPWRITE_ENDPOINT
const projectId = process.env.APPWRITE_PROJECT_ID
const apiKey = process.env.APPWRITE_API_KEY

if (!endpoint || !projectId || !apiKey) {
  // Do not throw here; API routes will validate and respond with clear error
  // This module may be imported client-side accidentally; keep safe
}

export const appwriteServerClient = (() => {
  const client = new Client()
  if (endpoint) client.setEndpoint(endpoint)
  if (projectId) client.setProject(projectId)
  if (apiKey) client.setKey(apiKey)
  return client
})()

export const appwriteDatabases = new Databases(appwriteServerClient)
export const appwriteIds = { ID }


