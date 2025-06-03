import BlogHeader from "./BlogHeader"
import BlogLoadingSkeleton from "./BlogLoadingSkeleton";

export const BlogPageSkeleton = () => {
  return (
    <div className="blogs-page-loading">
    <BlogHeader
      title="บทความของเรา"
      searchQuery={""}
      isLoading={true}
      isRefreshing={false}
    />
    <div className="loading-skeleton-container mt-4">
      <BlogLoadingSkeleton />
    </div>
  </div>
  );
};
