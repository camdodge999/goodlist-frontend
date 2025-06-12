import { Blog } from '@/types/blog';

interface BlogStatsCardsProps {
  blogs: Blog[];
}

export default function BlogStatsCards({ blogs }: BlogStatsCardsProps) {
  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter(b => b.status === 'published').length;
  const draftBlogs = blogs.filter(b => b.status === 'draft').length;
  const totalViews = blogs.reduce((sum, blog) => sum + blog.viewCount, 0);

  const stats = [
    {
      title: 'บทความทั้งหมด',
      value: totalBlogs,
      color: 'text-gray-900'
    },
    {
      title: 'เผยแพร่แล้ว',
      value: publishedBlogs,
      color: 'text-green-600'
    },
    {
      title: 'ร่าง',
      value: draftBlogs,
      color: 'text-yellow-600'
    },
    {
      title: 'ยอดเข้าชมบทความทั้งหมด',
      value: totalViews.toLocaleString(),
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
} 