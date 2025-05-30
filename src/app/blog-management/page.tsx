'use client';

import { useState, useEffect } from 'react';

// Types based on the provided schema
interface Blog {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  linkPath?: string;
  fileMarkdownPath?: string;
  status: 'draft' | 'published' | 'archived' | 'deleted';
  publishedAt?: string;
  userId: number;
  createdById: number;
  updatedById: number;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  tags?: string;
  metaDescription?: string;
  featured: boolean;
  author: {
    id: number;
    name: string;
    email: string;
  };
}

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  linkPath: string;
  fileMarkdownPath: string;
  status: 'draft' | 'published' | 'archived' | 'deleted';
  tags: string;
  metaDescription: string;
  featured: boolean;
}

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    linkPath: '',
    fileMarkdownPath: '',
    status: 'draft',
    tags: '',
    metaDescription: '',
    featured: false
  });

  // Mock data based on the existing API structure but extended with schema fields
  const mockBlogsExtended: Blog[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Getting Started with Next.js 14',
      slug: 'getting-started-nextjs-14',
      content: '# Getting Started with Next.js 14\n\nNext.js 14 brings exciting new features...',
      excerpt: 'Learn how to build modern web applications with Next.js 14 and its latest features.',
      linkPath: '/blog/getting-started-nextjs-14',
      fileMarkdownPath: '/content/blogs/nextjs-14.md',
      status: 'published',
      publishedAt: '2024-01-15T10:00:00Z',
      userId: 1,
      createdById: 1,
      updatedById: 1,
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      viewCount: 1250,
      likeCount: 89,
      shareCount: 23,
      commentCount: 15,
      tags: 'nextjs,react,web-development',
      metaDescription: 'Complete guide to getting started with Next.js 14 and its latest features',
      featured: true,
      author: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      }
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Mastering React Hooks',
      slug: 'mastering-react-hooks',
      content: '# Mastering React Hooks\n\nReact Hooks revolutionized how we write React components...',
      excerpt: 'Deep dive into React hooks and learn how to use them effectively in your applications.',
      linkPath: '/blog/mastering-react-hooks',
      fileMarkdownPath: '/content/blogs/react-hooks.md',
      status: 'published',
      publishedAt: '2024-01-10T14:30:00Z',
      userId: 2,
      createdById: 2,
      updatedById: 2,
      createdAt: '2024-01-10T13:00:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
      viewCount: 890,
      likeCount: 67,
      shareCount: 18,
      commentCount: 12,
      tags: 'react,hooks,javascript',
      metaDescription: 'Master React hooks with practical examples and best practices',
      featured: false,
      author: {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com'
      }
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Building Responsive Layouts with Tailwind CSS',
      slug: 'responsive-layouts-tailwind',
      content: '# Building Responsive Layouts with Tailwind CSS\n\nTailwind CSS makes it easy...',
      excerpt: 'Learn how to create beautiful, responsive layouts using Tailwind CSS utility classes.',
      linkPath: '/blog/responsive-layouts-tailwind',
      fileMarkdownPath: '/content/blogs/tailwind-responsive.md',
      status: 'draft',
      publishedAt: undefined,
      userId: 3,
      createdById: 3,
      updatedById: 3,
      createdAt: '2024-01-05T09:15:00Z',
      updatedAt: '2024-01-05T09:15:00Z',
      viewCount: 0,
      likeCount: 0,
      shareCount: 0,
      commentCount: 0,
      tags: 'tailwind,css,responsive-design',
      metaDescription: 'Create beautiful responsive layouts with Tailwind CSS utility classes',
      featured: false,
      author: {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike@example.com'
      }
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBlogs(mockBlogsExtended);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.tags?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateBlog = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      linkPath: '',
      fileMarkdownPath: '',
      status: 'draft',
      tags: '',
      metaDescription: '',
      featured: false
    });
    setEditingBlog(null);
    setShowCreateModal(true);
  };

  const handleEditBlog = (blog: Blog) => {
    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      linkPath: blog.linkPath || '',
      fileMarkdownPath: blog.fileMarkdownPath || '',
      status: blog.status,
      tags: blog.tags || '',
      metaDescription: blog.metaDescription || '',
      featured: blog.featured
    });
    setEditingBlog(blog);
    setShowCreateModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to create/update the blog
    console.log('Submitting blog:', formData);
    setShowCreateModal(false);
    // Refresh the blogs list
  };

  const handleDeleteBlog = (blogId: string) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      setBlogs(blogs.filter(blog => blog.id !== blogId));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800',
      deleted: 'bg-red-100 text-red-800'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.draft;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="mt-2 text-gray-600">Manage your blog posts, drafts, and published content</p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Search blogs"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateBlog}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="mr-2">+</span>
            Create Blog
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Blogs</h3>
            <p className="text-2xl font-bold text-gray-900">{blogs.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Published</h3>
            <p className="text-2xl font-bold text-green-600">
              {blogs.filter(b => b.status === 'published').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Drafts</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {blogs.filter(b => b.status === 'draft').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
            <p className="text-2xl font-bold text-blue-600">
              {blogs.reduce((sum, blog) => sum + blog.viewCount, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Blogs Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blog
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {blog.title}
                            {blog.featured && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{blog.excerpt}</div>
                          {blog.tags && (
                            <div className="mt-1">
                              {blog.tags.split(',').map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{blog.author.name}</div>
                      <div className="text-sm text-gray-500">{blog.author.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(blog.status)}`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Views: {blog.viewCount.toLocaleString()}</div>
                      <div>Likes: {blog.likeCount}</div>
                      <div>Comments: {blog.commentCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded"
                          title="View blog post"
                          aria-label={`View blog post: ${blog.title}`}
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleEditBlog(blog)}
                          className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded"
                          title="Edit blog post"
                          aria-label={`Edit blog post: ${blog.title}`}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded"
                          title="Delete blog post"
                          aria-label={`Delete blog post: ${blog.title}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingBlog ? 'Edit Blog' : 'Create New Blog'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
                      <input
                        id="slug"
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">Excerpt</label>
                    <textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      rows={10}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Write your blog content in Markdown..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="linkPath" className="block text-sm font-medium text-gray-700">Link Path</label>
                      <input
                        id="linkPath"
                        type="text"
                        value={formData.linkPath}
                        onChange={(e) => setFormData({...formData, linkPath: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="/blog/your-post-slug"
                      />
                    </div>
                    <div>
                      <label htmlFor="fileMarkdownPath" className="block text-sm font-medium text-gray-700">Markdown File Path</label>
                      <input
                        id="fileMarkdownPath"
                        type="text"
                        value={formData.fileMarkdownPath}
                        onChange={(e) => setFormData({...formData, fileMarkdownPath: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="/content/blogs/your-post.md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                      <input
                        id="tags"
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="react,nextjs,javascript"
                      />
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                        <option value="deleted">Deleted</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">Meta Description</label>
                    <textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                      rows={2}
                      maxLength={160}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="SEO meta description (max 160 characters)"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="featured"
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Featured Post
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingBlog ? 'Update Blog' : 'Create Blog'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
