import BlogHeader from "./BlogHeader"
import BlogLoadingSkeleton from "./BlogLoadingSkeleton";

export const BlogPageSkeleton = () => {
  return (
    <div className="blogs-page-loading">
    <BlogHeader
      title="บล็อกของเรา"
      searchQuery={""}
      onSearchChange={() => {}}
      isLoading={false}
      isRefreshing={false}
      onRefresh={() => {}}
    />
    <div className="loading-skeleton-container mt-4">
      <BlogLoadingSkeleton />
    </div>
  </div>
  );
};
