import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  user: {
    admin: false,
    // Thêm các thuộc tính khác nếu cần
  },
  token: null,
  posts: [],
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = {
        ...action.payload.user,
        admin: action.payload.user.admin || false, // Đảm bảo rằng vai trò admin được thiết lập
      };
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = {
        admin: false, // Reset vai trò admin khi đăng xuất
      };
      state.token = null;
    },
    setFriends: (state, action) => {
      if (state.user) {
        state.user.friends = action.payload.friends;
      } else {
        console.error("user friends non-existent :(");
      }
    },
    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      state.posts = updatedPosts;
    },
  },
});

export const { setMode, setLogin, setLogout, setFriends, setPosts, setPost } =
  authSlice.actions;
export default authSlice.reducer;
