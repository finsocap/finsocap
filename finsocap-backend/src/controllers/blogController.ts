import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

// =======================================================
// BLOG POSTS / CMS STUDIO CONTROLLER
// Complete content publishing engine for Finsocap articles
// =======================================================

export async function getAllPosts(req: Request, res: Response) {
  try {
    const { published, category, search } = req.query;

    const where: any = {};
    if (published !== undefined) {
      where.published = published === 'true';
    }
    if (category) {
      where.category = String(category);
    }
    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { excerpt: { contains: String(search) } },
        { content: { contains: String(search) } },
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, count: posts.length, posts });
  } catch (error: any) {
    console.error('getAllPosts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve blog posts' });
  }
}

export async function getPostBySlug(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);

    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    return res.json({ success: true, post });
  } catch (error: any) {
    console.error('getPostBySlug error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch post' });
  }
}

export async function createPost(req: Request, res: Response) {
  try {
    const { title, excerpt, content, category, author, tags, coverImage, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title,
        excerpt: excerpt || title.slice(0, 150),
        content,
        category: category || 'Finance',
        author: author || 'FinSoCap Editorial',
        tags: tags || '',
        coverImage: coverImage || null,
        published: published ?? true,
        publishedAt: published ? new Date() : null,
      },
    });

    return res.status(201).json({ success: true, message: 'Post published successfully', post });
  } catch (error: any) {
    console.error('createPost error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create post', error: error.message });
  }
}

export async function updatePost(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const { title, excerpt, content, category, author, tags, coverImage, published } = req.body;

    const data: any = {};
    if (title) data.title = title;
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (content) data.content = content;
    if (category) data.category = category;
    if (author) data.author = author;
    if (tags !== undefined) data.tags = tags;
    if (coverImage !== undefined) data.coverImage = coverImage;
    if (published !== undefined) {
      data.published = published;
      if (published) data.publishedAt = new Date();
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data,
    });

    return res.json({ success: true, message: 'Post updated', post: updated });
  } catch (error: any) {
    console.error('updatePost error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update post' });
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    await prisma.blogPost.delete({ where: { id } });
    return res.json({ success: true, message: 'Post deleted' });
  } catch (error: any) {
    console.error('deletePost error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete post' });
  }
}
