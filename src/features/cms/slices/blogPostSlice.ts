import { createSliceFactory } from "@/utils/sliceFactory"
import type { BlogPost } from "../types"

const { reducer, fetchAll, fetchSingle, postData, updateData, patchData, deleteData } =
  createSliceFactory<BlogPost>({
    name: "blogPosts",
    endpoint: "/admin/cms/blog-posts/",
  })

export { fetchAll, fetchSingle, postData, updateData, patchData, deleteData }

export default reducer
