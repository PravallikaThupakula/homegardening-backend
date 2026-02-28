import supabase from "../config/supabaseClient.js";

export const uploadFile = async (bucket, fileName, buffer, contentType) => {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return data.publicUrl;
};