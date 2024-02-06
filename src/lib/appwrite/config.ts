import { Client, Account, Databases, Avatars, Storage} from "appwrite";

export const appWriteConfig = {
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    url : import.meta.env.VITE_APPWRITE_URL,
    databaseId : import.meta.env.VITE_APPWRITE_DATABASE_ID ,
    storageId : import.meta.env.VITE_APPWRITE_STORAGE_ID,
    savesCollectionId : import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
    userCollectionId : import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
    postsCollectionId : import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID
}

export const client = new Client();

client.setProject(appWriteConfig.projectId);
client.setEndpoint(appWriteConfig.url);


export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
