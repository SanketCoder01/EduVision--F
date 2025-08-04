import { supabase } from "./supabase"

export async function uploadFile(file: File, bucket: string, folder = "") {
  try {
    // Create a unique file name to avoid collisions
    const fileName = `${folder ? `${folder}/` : ""}${Date.now()}-${file.name.replace(/\s+/g, "_")}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file)

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)

    return {
      success: true,
      fileName,
      fileUrl: urlData.publicUrl,
      fileType: file.type,
      fileSize: file.size,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { success: false, error }
  }
}

export async function uploadAssignmentResource(file: File, assignmentId: string) {
  return uploadFile(file, "assignment-resources", assignmentId)
}

export async function uploadSubmissionFile(file: File, assignmentId: string, studentId: string) {
  return uploadFile(file, "submission-files", `${assignmentId}/${studentId}`)
}

export async function deleteFile(fileName: string, bucket: string) {
  try {
    const { error } = await supabase.storage.from(bucket).remove([fileName])

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error deleting file:", error)
    return { success: false, error }
  }
}
