import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit } from '@fortawesome/free-solid-svg-icons';
// import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Blog } from '@/types/blog';

interface BlogTableProps {
  readonly blogs: Blog[];
  readonly onEdit: (blog: Blog) => void;
  // readonly onDelete: (blogId: string) => void;
}

export default function BlogTable({ blogs, onEdit }: BlogTableProps) {
  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800',
      deleted: 'bg-red-100 text-red-800'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.draft;
  };

  const getStatusBlog = (status: string) => {
    const statusBlog = {
      draft: 'ร่าง',
      published: 'เผยแพร่แล้ว',
      archived: 'จัดเก็บแล้ว',
      deleted: 'ลบ'
    };  
    return statusBlog[status as keyof typeof statusBlog] || statusBlog.draft;
  };


  if (blogs.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-500">No blogs found. Create your first blog post!</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                บทความ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ผู้เขียน
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ยอดเข้าชม
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่สร้าง
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                การดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blogs.map((blog) => (
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
                      <div className="text-sm text-gray-500">{blog.excerpt?.slice(0, 50)}{blog?.excerpt?.length && blog?.excerpt?.length > 50 ? '...' : ''}</div>
                      {blog.tags && (
                        <div className="mt-1">
                          {(typeof blog.tags === 'string' ? blog.tags.split(',') : blog.tags).map((tag: string, index: number) => (
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
                  <div className="text-sm text-gray-900">{blog.createdBy?.displayName || 'Unknown Author'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(blog.status)}`}>
                    {getStatusBlog(blog.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Views: {blog.viewCount.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'Unknown Date'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`/blogs/${blog.slug}`, '_blank')}
                      className="text-blue-600 hover:text-blue-900 cursor-pointer px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      title="View blog post"
                      aria-label={`View blog post: ${blog.title}`}
                    >
                      <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(blog)}
                      className="text-indigo-600 hover:text-indigo-900 cursor-pointer px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                      title="Edit blog post"
                      aria-label={`Edit blog post: ${blog.title}`}
                    >
                      <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                    </button>
                    {/* <button
                      onClick={() => onDelete(blog.id)}
                      className="text-red-600 hover:text-red-900 cursor-pointer px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete blog post"
                      aria-label={`Delete blog post: ${blog.title}`}
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 