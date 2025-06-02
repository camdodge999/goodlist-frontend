"use client"

import * as React from "react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
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
  faHeading
} from "@fortawesome/free-solid-svg-icons"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content in Markdown...",
  className,
  minHeight = "400px"
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

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
      icon: faImage,
      title: "Image",
      action: () => insertText("![", "](image-url)", "alt text")
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
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  title={button.title}
                  className="h-8 w-8 p-0"
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
              "w-full resize-none border-0 bg-transparent p-4 text-sm outline-none focus:ring-0",
              `min-h-[${minHeight}]`
            )}
            style={{ minHeight }}
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div 
            className={cn(
              "prose prose-sm max-w-none p-4 dark:prose-invert",
              `min-h-[${minHeight}]`
            )}
            style={{ minHeight }}
          >
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  // Custom components for better styling
                  h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                  p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className
                    return isInline ? (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    )
                  },
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-3">
                      {children}
                    </pre>
                  ),
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">ยังไม่มีข้อความให้แสดง</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 