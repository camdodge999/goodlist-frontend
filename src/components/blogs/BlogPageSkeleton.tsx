import BlogLoadingSkeleton from "./BlogLoadingSkeleton";

export const BlogPageSkeleton = () => {
  return (
    <div className="blogs-page-loading">
      <div className="loading-skeleton-container mt-4">
        <BlogLoadingSkeleton />
      </div>
    </div>
  );
};
