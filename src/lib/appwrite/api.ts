import { INewPost, INewUser, IUpdatePost } from "@/types";
import { account, appWriteConfig, avatars, databases, storage } from "./config";
import { ID, Query } from "appwrite";

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    )
    if (!newAccount) throw Error;
    const avatarUrl = avatars.getInitials(user.name);
    // const newuser = await saveUserToDB(newAccount)
    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });
    return newUser;
  } catch (error) {
    console.log(error)
    return error;
  }

}

export async function saveUserToDB(user: { accountId: string; email: string; name: string; imageUrl: URL; username?: string }) {
  try {
    const newUser = await databases.createDocument(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      ID.unique(),
      user
    )
    return newUser;
  } catch (error) {
    console.log(error);
  }
}


export async function signInAccount(user: { email: string, password: string }) {

  try {
    const session = await account.createEmailSession(user.email, user.password);
    return session;
  } catch (error) {
    console.log(error);
    return null;
  }

}


export async function signOutAccount() {

  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.log(error);
    return null;
  }

}


export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    console.log(currentAccount)
    if (!currentAccount) throw Error;
    const currentUser = await databases.listDocuments(
      appWriteConfig.databaseId,
      appWriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )
    if (!currentUser) throw Error;
    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
}



// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    //upload image to storage
    const uploadedFile = await uploadFile(post.file[0]);

    //save post to database

    if (!uploadedFile) throw Error;
    const fileUrl = await getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFileUrl(uploadedFile.$id);
      throw Error
    };
    //convert tags into an array
    const tags = post.tags?.replace(/ /g, '').split(',') || [];

    //save post to database
    const newPost = await databases.createDocument(appWriteConfig.databaseId, appWriteConfig.postsCollectionId, ID.unique(), {
      creator: post.userId,
      caption: post.caption,
      imageUrl: fileUrl,
      imageId: uploadedFile.$id,
      location: post.location,
      tags: tags
    })
    if (!newPost) {
      await deleteFileUrl(uploadedFile.$id);
      throw Error;
    }
    return newPost;
  } catch (error) {
    console.log(error);
  }
}


export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appWriteConfig.storageId,
      ID.unique(),
      file
    );
    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

export async function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appWriteConfig.storageId,
      fileId,
      2000,
      2000,
      "top",
      100
    )
    return fileUrl;

  } catch (error) {
    console.log(error)
  }

}


export async function deleteFileUrl(fileId: string) {
  try {
    await storage.deleteFile(appWriteConfig.storageId, fileId);
    return { status: "ok" }
  } catch (error) {
    console.log(error);
  }

}


export async function getRecentPosts() {
  const posts = await databases.listDocuments(appWriteConfig.databaseId, appWriteConfig.postsCollectionId,
    [Query.orderDesc('$createdAt'), Query.limit(20)]
  )

  if (!posts) throw Error
  return posts;
}

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(appWriteConfig.databaseId, appWriteConfig.postsCollectionId, postId, {
      likes: likesArray
    })
    if (!updatedPost) throw Error;
    return updatedPost;
  } catch (error) {
    console.log(error)
  }
}


export async function savePost(postId: string, userId: string) {
  try {
    const updatedPost = await databases.createDocument(appWriteConfig.databaseId, appWriteConfig.savesCollectionId, ID.unique(), {
      user: userId,
      post: postId
    })
    if (!updatedPost) throw Error;
    return updatedPost;
  } catch (error) {
    console.log(error)
  }
}



export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(appWriteConfig.databaseId, appWriteConfig.savesCollectionId, savedRecordId)
    if (!statusCode) throw Error;
    return { status: "ok" };
  } catch (error) {
    console.log(error)
  }
}


export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument(appWriteConfig.databaseId, appWriteConfig.postsCollectionId, postId);
    if (!post) throw Error;
    return post;
  } catch (error) {
    console.log(error);
  }
}



export async function updatePost(post: IUpdatePost) {

  const hasFileToUpdate = post.file.length > 0;
  try {

    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId

    }

    if (hasFileToUpdate) {
      //upload image to storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;
      const fileUrl = await getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFileUrl(uploadedFile.$id);
        throw Error
      };
      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }


    //save post to database


    


    //convert tags into an array
    const tags = post.tags?.replace(/ /g, '').split(',') || [];

    //save post to database
    const updatedPost = await databases.updateDocument(appWriteConfig.databaseId, appWriteConfig.postsCollectionId, post.postId, {
      caption: post.caption,
      imageUrl: image.imageUrl,
      imageId: image.imageId,
      location: post.location,
      tags: tags
    })
    if (!updatedPost) {
      await deleteFileUrl(post.imageId);
      throw Error;
    }
    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}


export async function deletePost(postId: string, imagedId: string) {

  if (!postId || !imagedId) throw Error;
  try{
  await databases.deleteDocument(appWriteConfig.databaseId, appWriteConfig.postsCollectionId, postId);
  return {status : "ok"}
  } catch(error){
    console.log(error);
  }


}
