// Forum controllers rewritten to use Supabase
const { addXP } = require("../utils/xpHelpers");
const supabase = require("../config/supabaseClient");

// Get all forum posts (with comment count and like count)
exports.getAllPosts = async (req, res) => {
  try {
    // fetch posts
    const { data: posts = [], error: postsErr } = await supabase
      .from('forumposts')
      .select('*')
      .order('created_at', { ascending: false });
    if (postsErr) throw postsErr;

    const postIds = posts.map((p) => p.id).filter(Boolean);

    const [commentsRes, likesRes] = await Promise.all([
      postIds.length
        ? supabase.from('forumcomments').select('*').in('post_id', postIds)
        : { data: [], error: null },
      postIds.length
        ? supabase.from('forumlikes').select('*').in('post_id', postIds)
        : { data: [], error: null },
    ]);

    if (commentsRes.error) throw commentsRes.error;
    if (likesRes.error) throw likesRes.error;

    const comments = commentsRes.data || [];
    const likes = likesRes.data || [];

    const commentCount = comments.reduce((acc, c) => {
      acc[c.post_id] = (acc[c.post_id] || 0) + 1;
      return acc;
    }, {});
    const likeCount = likes.reduce((acc, l) => {
      acc[l.post_id] = (acc[l.post_id] || 0) + 1;
      return acc;
    }, {});

    const userIds = [...new Set(posts.map((p) => p.user_id))].filter(Boolean);
    const { data: users = [], error: usersErr } = userIds.length
      ? await supabase.from('users').select('id,name,email,xp').in('id', userIds)
      : { data: [], error: null };
    if (usersErr) throw usersErr;
    const userMap = users.reduce((m, u) => { m[u.id] = u; return m; }, {});

    const result = posts.map((p) => ({
      ...p,
      user: userMap[p.user_id] || null,
      comment_count: commentCount[p.id] || 0,
      likes: likeCount[p.id] || 0,
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Create a new forum post — +2 XP
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const userId = req.user.id;
    const insertData = {
      user_id: userId,
      title,
      content,
      category: category || "general",
      tags: Array.isArray(tags) ? tags.slice(0,5) : [],
    };

    const { data, error } = await supabase.from('forumposts').insert([insertData]);
    if (error) throw error;
    await addXP(supabase, userId, 2);
    res.status(201).json(data && data[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get post by ID with comments
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: posts, error: postErr } = await supabase.from('forumposts').select('*').eq('id', id).limit(1);
    if (postErr) throw postErr;
    const post = (posts && posts[0]) || null;
    if (!post) return res.status(404).json({ error: "Post not found" });

    const { data: comments = [], error: commentsErr } = await supabase
      .from('forumcomments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    if (commentsErr) throw commentsErr;

    const { data: likes = [], error: likesErr } = await supabase
      .from('forumlikes')
      .select('id')
      .eq('post_id', id);
    if (likesErr) throw likesErr;

    const userIds = [post.user_id, ...comments.map(c=>c.user_id)].filter(Boolean);
    const { data: users = [], error: usersErr } = userIds.length
      ? await supabase.from('users').select('id,name,email,xp').in('id', userIds)
      : { data: [], error: null };
    if (usersErr) throw usersErr;
    const userMap = users.reduce((m,u)=>{m[u.id]=u;return m;},{});

    res.json({
      ...post,
      user: userMap[post.user_id] || null,
      comments: comments.map(c=>({
        ...c,
        user: userMap[c.user_id] || null,
      })),
      likes: likes.length || 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Add comment to post — +5 XP
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase.from('forumcomments').insert([
      { post_id: postId, user_id: userId, content }
    ]);
    if (error) throw error;

    await addXP(supabase, userId, 5);
    res.status(201).json(data && data[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Like/Unlike a post
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const { data: existing = [], error: findErr } = await supabase
      .from('forumlikes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .limit(1);
    if (findErr) throw findErr;

    if (existing && existing.length) {
      const likeId = existing[0].id;
      const { error: delErr } = await supabase.from('forumlikes').delete().eq('id', likeId);
      if (delErr) throw delErr;
      res.json({ liked: false });
    } else {
      const { data, error: insertErr } = await supabase.from('forumlikes').insert([
        { post_id: postId, user_id: userId }
      ]);
      if (insertErr) throw insertErr;
      await addXP(supabase, userId, 3);
      res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Search forum posts
exports.searchPosts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) return res.status(400).json({ error: "Search query required" });
    const q = `%${query}%`;
    const { data, error } = await supabase
      .from('forumposts')
      .select('*')
      .or(`title.ilike.${q},content.ilike.${q}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
