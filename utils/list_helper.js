const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const likes = blogs.map((el) => el.likes);
  const reducer = (sum, item) => sum + item;
  return likes.length === 0 ? 0 : likes.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  const likes = blogs.map((el) => el.likes);
  const maxLikes = Math.max(...likes);
  const mostLikedBlog = blogs.find((blog) => blog.likes === maxLikes);
  return blogs.length === 0 ? 0 : mostLikedBlog;
};

const mostBlogs = (blogs) => {
  const authorCount = {};
  for (let blog of blogs) {
    const author = blog.author;
    authorCount[author] = (authorCount[author] || 0) + 1;
  }

  let maxBlogs = 0;
  let topAuthor = "";
  for (const author in authorCount) {
    if (authorCount[author] > maxBlogs) {
      maxBlogs = authorCount[author];
      topAuthor = author;
    }
  }

  if (blogs.length === 0) {
    return null;
  }
  return {
    author: topAuthor,
    blogs: maxBlogs,
  };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null;

  const authorLikes = {};

  // Accumulate likes for each author
  blogs.forEach((blog) => {
    if (authorLikes[blog.author]) {
      authorLikes[blog.author] += blog.likes;
    } else {
      authorLikes[blog.author] = blog.likes;
    }
  });

  // Find the author with the most likes
  let mostLikedAuthor = "";
  let maxLikes = 0;

  for (const author in authorLikes) {
    if (authorLikes[author] > maxLikes) {
      maxLikes = authorLikes[author];
      mostLikedAuthor = author;
    }
  }

  return { author: mostLikedAuthor, likes: maxLikes };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
