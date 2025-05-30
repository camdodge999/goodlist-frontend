import { NextRequest, NextResponse } from "next/server";

// Mockup blog data with markdown content
const mockBlogs = [
  {
    id: 1,
    title: "Getting Started with Next.js 14",
    slug: "getting-started-nextjs-14",
    excerpt: "Learn how to build modern web applications with Next.js 14 and its latest features.",
    content: `# Getting Started with Next.js 14

Next.js 14 brings exciting new features and improvements that make building React applications even better.

## Key Features

- **App Router**: The new app directory structure
- **Server Components**: Better performance with server-side rendering
- **Turbopack**: Faster development builds

## Installation

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Creating Your First Page

Create a new page by adding a file to the \`app\` directory:

\`\`\`tsx
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Next.js 14!</h1>
    </div>
  );
}
\`\`\`

This is just the beginning of your Next.js journey!`,
    author: "John Doe",
    publishedAt: "2024-01-15T10:00:00Z",
    tags: ["nextjs", "react", "web-development"],
    readTime: 5
  },
  {
    id: 2,
    title: "Mastering React Hooks",
    slug: "mastering-react-hooks",
    excerpt: "Deep dive into React hooks and learn how to use them effectively in your applications.",
    content: `# Mastering React Hooks

React Hooks revolutionized how we write React components. Let's explore the most important ones.

## useState Hook

The \`useState\` hook lets you add state to functional components:

\`\`\`tsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

## useEffect Hook

Handle side effects in your components:

\`\`\`tsx
import { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
\`\`\`

## Custom Hooks

Create reusable logic with custom hooks:

\`\`\`tsx
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}
\`\`\`

Hooks make React components more powerful and reusable!`,
    author: "Jane Smith",
    publishedAt: "2024-01-10T14:30:00Z",
    tags: ["react", "hooks", "javascript"],
    readTime: 8
  },
  {
    id: 3,
    title: "Building Responsive Layouts with Tailwind CSS",
    slug: "responsive-layouts-tailwind",
    excerpt: "Learn how to create beautiful, responsive layouts using Tailwind CSS utility classes.",
    content: `# Building Responsive Layouts with Tailwind CSS

Tailwind CSS makes it easy to build responsive, mobile-first designs with utility classes.

## Mobile-First Approach

Start with mobile styles and add larger screen styles:

\`\`\`html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Content -->
</div>
\`\`\`

## Flexbox Layouts

Create flexible layouts with Flexbox utilities:

\`\`\`html
<div class="flex flex-col md:flex-row gap-4">
  <div class="flex-1 bg-blue-100 p-4">
    <h2 class="text-xl font-bold">Main Content</h2>
  </div>
  <div class="w-full md:w-64 bg-gray-100 p-4">
    <h3 class="text-lg font-semibold">Sidebar</h3>
  </div>
</div>
\`\`\`

## Grid Layouts

Use CSS Grid for complex layouts:

\`\`\`html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="bg-white p-6 rounded-lg shadow">Card 1</div>
  <div class="bg-white p-6 rounded-lg shadow">Card 2</div>
  <div class="bg-white p-6 rounded-lg shadow">Card 3</div>
</div>
\`\`\`

## Responsive Typography

Scale text appropriately across devices:

\`\`\`html
<h1 class="text-2xl md:text-4xl lg:text-6xl font-bold">
  Responsive Heading
</h1>
<p class="text-sm md:text-base lg:text-lg text-gray-600">
  Responsive paragraph text.
</p>
\`\`\`

Tailwind makes responsive design intuitive and maintainable!`,
    author: "Mike Johnson",
    publishedAt: "2024-01-05T09:15:00Z",
    tags: ["tailwind", "css", "responsive-design"],
    readTime: 6
  }
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    
    // Filter blogs based on search query
    let filteredBlogs = mockBlogs;
    if (search) {
        filteredBlogs = mockBlogs.filter(blog => 
            blog.title.toLowerCase().includes(search.toLowerCase()) ||
            blog.excerpt.toLowerCase().includes(search.toLowerCase()) ||
            blog.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
        );
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBlogs = filteredBlogs.slice(startIndex, endIndex);
    
    // Return paginated response
    return NextResponse.json({
        blogs: paginatedBlogs,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(filteredBlogs.length / limit),
            totalBlogs: filteredBlogs.length,
            hasNextPage: endIndex < filteredBlogs.length,
            hasPrevPage: page > 1
        }
    });
}

