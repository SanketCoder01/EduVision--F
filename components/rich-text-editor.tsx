"use client"

import { useState } from "react"
import { Bold, Italic, List, ListOrdered, Link, ImageIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = "200px" }: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")

  const insertMarkdown = (markdownSymbol: string, selectionWrapper?: (text: string) => string) => {
    const textarea = document.getElementById("rich-text-editor") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let newText = value

    if (selectionWrapper && selectedText) {
      // If text is selected and we have a wrapper function, use it
      const wrappedText = selectionWrapper(selectedText)
      newText = value.substring(0, start) + wrappedText + value.substring(end)
    } else if (selectedText) {
      // If text is selected but no wrapper, wrap with markdown symbol
      newText = value.substring(0, start) + markdownSymbol + selectedText + markdownSymbol + value.substring(end)
    } else {
      // If no text is selected, just insert the markdown symbol
      newText = value.substring(0, start) + markdownSymbol + value.substring(end)
    }

    onChange(newText)

    // Set focus back to textarea and set cursor position
    setTimeout(() => {
      textarea.focus()
      if (selectionWrapper && selectedText) {
        const wrappedText = selectionWrapper(selectedText)
        textarea.selectionStart = start + wrappedText.length
        textarea.selectionEnd = start + wrappedText.length
      } else if (selectedText) {
        textarea.selectionStart = start + markdownSymbol.length + selectedText.length + markdownSymbol.length
        textarea.selectionEnd = start + markdownSymbol.length + selectedText.length + markdownSymbol.length
      } else {
        textarea.selectionStart = start + markdownSymbol.length
        textarea.selectionEnd = start + markdownSymbol.length
      }
    }, 0)
  }

  const renderMarkdown = (text: string) => {
    // Very basic markdown rendering for preview
    // In a real app, you'd use a proper markdown parser
    let html = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br />")
      .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

    // Handle lists
    html = html.replace(/^- (.*?)$/gm, "<li>$1</li>").replace(/<li>.*?<\/li>/gs, "<ul>$&</ul>")
    html = html.replace(/^\d+\. (.*?)$/gm, "<li>$1</li>").replace(/<li>.*?<\/li>/gs, "<ol>$&</ol>")

    return html
  }

  return (
    <div className="border rounded-md">
      <div className="flex items-center gap-1 p-1 border-b bg-gray-50">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertMarkdown("**", (text) => `**${text}**`)}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertMarkdown("*", (text) => `*${text}*`)}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertMarkdown("\n- ", (text) => `\n- ${text}`)}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertMarkdown("\n1. ", (text) => `\n1. ${text}`)}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertMarkdown("[Link Text](https://example.com)", (text) => `[${text}](https://example.com)`)}
          title="Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() =>
            insertMarkdown(
              "![Image Alt](https://example.com/image.jpg)",
              (text) => `![${text}](https://example.com/image.jpg)`,
            )
          }
          title="Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        defaultValue="write"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "write" | "preview")}
      >
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-2">
          <TabsTrigger
            value="write"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600"
          >
            Write
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600"
          >
            Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="p-0 m-0">
          <Textarea
            id="rich-text-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Enter detailed instructions for the assignment..."}
            className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{ minHeight }}
          />
        </TabsContent>
        <TabsContent value="preview" className="p-4 prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
        </TabsContent>
      </Tabs>

      <div className="px-3 py-2 text-xs text-gray-500 border-t">
        Supports Markdown: **bold**, *italic*, lists, and [links](https://example.com)
      </div>
    </div>
  )
}
