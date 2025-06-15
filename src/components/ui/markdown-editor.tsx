"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import ReactMarkdown, { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faBold, 
  faItalic, 
  faCode, 
  faLink, 
  faImage, 
  faListUl, 
  faListOl,
  faQuoteLeft,
  faHeading,
  faSpinner
} from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"

interface UploadedImage {
  fileName: string;
  path: string;
  url: string;
  size: number;
  type: string;
}

interface MarkdownEditorProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly onImageUpload?: (images: UploadedImage[]) => void
  readonly initialUploadedImages?: UploadedImage[]
  readonly placeholder?: string
  readonly className?: string
}

export function MarkdownEditor({
  value,
  onChange,
  onImageUpload,
  initialUploadedImages = [],
  placeholder = "Write your content in Markdown...",
  className,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(initialUploadedImages)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update uploadedImages when initialUploadedImages changes
  useEffect(() => {
    setUploadedImages(initialUploadedImages)
  }, [initialUploadedImages])

  // Memoize components to avoid recreation on every render
  const markdownComponents = React.useMemo(() => ({
    h1: ({ children }: { children: React.ReactNode }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
    h2: ({ children }: { children: React.ReactNode }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
    h3: ({ children }: { children: React.ReactNode }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
    p: ({ children }: { children: React.ReactNode }) => <p className="mb-3 leading-relaxed">{children}</p>,
    ul: ({ children }: { children: React.ReactNode }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
    ol: ({ children }: { children: React.ReactNode }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3">
        {children}
      </blockquote>
    ),
    code: ({ children, className }: { children: React.ReactNode; className?: string }) => {
      const isInline = !className
      return isInline ? (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      ) : (
        <code className={className}>{children}</code>
      )
    },
    pre: ({ children }: { children: React.ReactNode }) => (
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-3">
        {children}
      </pre>
    ),
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <Image
        src={src as string} 
        alt={alt || ""} 
        className="max-w-full h-auto rounded-lg shadow-sm mb-3"
        loading="lazy"
        width={800}
        height={600}
      />
    ),
  }), [])

  const insertText = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end)
    
    onChange(newText)
    
    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

    const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/blogs/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const result = await response.json()
      
      // Create uploaded image object
      const uploadedImage: UploadedImage = {
        fileName: result.fileName,
        path: result.path,
        url: result.url,
        size: result.size,
        type: result.type
      }
      
      // Add to uploaded images list
      const newUploadedImages = [...uploadedImages, uploadedImage]
      setUploadedImages(newUploadedImages)
      
      // Notify parent component
      if (onImageUpload) {
        onImageUpload(newUploadedImages)
      }
      
      // Insert the uploaded image into the markdown
      const altText = file.name.replace(/\.[^/.]+$/, "") // Remove file extension for alt text
      insertText(`![${altText}](${result.url})`, "", "")
      
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 5MB.')
      return
    }

    handleImageUpload(file)
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const toolbarButtons = [
    {
      icon: faHeading,
      title: "Heading",
      action: () => insertText("## ", "", "Heading")
    },
    {
      icon: faBold,
      title: "Bold",
      action: () => insertText("**", "**", "bold text")
    },
    {
      icon: faItalic,
      title: "Italic",
      action: () => insertText("*", "*", "italic text")
    },
    {
      icon: faCode,
      title: "Code",
      action: () => insertText("`", "`", "code")
    },
    {
      icon: faLink,
      title: "Link",
      action: () => insertText("[", "](url)", "link text")
    },
    {
      icon: isUploading ? faSpinner : faImage,
      title: "Upload Image",
      action: handleImageButtonClick,
      disabled: isUploading,
      className: isUploading ? "animate-spin" : ""
    },
    {
      icon: faListUl,
      title: "Bullet List",
      action: () => insertText("- ", "", "list item")
    },
    {
      icon: faListOl,
      title: "Numbered List",
      action: () => insertText("1. ", "", "list item")
    },
    {
      icon: faQuoteLeft,
      title: "Quote",
      action: () => insertText("> ", "", "quote")
    }
  ]

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Hidden file input */}
      <input
        title="Upload Image"
        placeholder="Upload Image"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "write" | "preview")}>
        <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-2">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          {activeTab === "write" && (
            <div className="flex items-center gap-1">
              {toolbarButtons.map((button, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  title={button.title}
                  disabled={button.disabled}
                  className={cn("h-8 w-8 p-0", button.className)}
                >
                  <FontAwesomeIcon icon={button.icon} className="h-3 w-3" />
                </Button>
              ))}
            </div>
          )}
        </div>

        <TabsContent value="write" className="m-0">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-full resize-none border-0 bg-transparent p-4 text-md outline-none focus:ring-0 break-words",
              `min-h-[600px]`
            )}
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div 
            className={cn(
              "prose prose-sm max-w-none break-words overflow-wrap-anywhere p-4 dark:prose-invert",
              `min-h-[600px]`
            )}
          >
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={markdownComponents as unknown as Components}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">ยังไม่มีข้อความให้แสดง</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Show uploaded images info */}
      {uploadedImages.length > 0 && (
        <div className="border-t bg-muted/30 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Uploaded images: {uploadedImages.length} file(s) ({(uploadedImages.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024).toFixed(2)} MB)
          </p>
        </div>
      )}
    </div>
  )
} 