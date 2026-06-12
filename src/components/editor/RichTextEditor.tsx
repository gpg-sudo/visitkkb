"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Quote,
    Minus,
    Code,
    Link as LinkIcon,
    Image as ImageIcon,
    Youtube as YoutubeIcon,
    Undo,
    Redo,
    Heading1,
    Heading2,
    Heading3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({
    content,
    onChange,
    placeholder = "Start writing...",
}: RichTextEditorProps) {
    const [linkUrl, setLinkUrl] = useState("");
    const [showLinkInput, setShowLinkInput] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                paragraph: {
                    HTMLAttributes: {
                        class: 'mb-6 leading-relaxed',
                    },
                },
                heading: {
                    levels: [1, 2, 3, 4],
                    HTMLAttributes: {
                        class: 'font-serif font-bold',
                    },
                },
            }),
            Underline,
            Image.configure({
                inline: false,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'w-full h-auto rounded-lg shadow-md my-8',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline hover:text-primary/80',
                },
            }),
            Youtube.configure({
                controls: true,
                HTMLAttributes: {
                    class: 'my-8 rounded-lg w-full',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            // Get HTML and ensure proper spacing
            let html = editor.getHTML();

            // Ensure paragraphs have proper spacing
            html = html
                .replace(/<p><\/p>/g, '') // Remove empty paragraphs
                .replace(/<p>([^<]+)<\/p>/g, '<p>$1</p>') // Clean paragraph content
                .replace(/<\/p><p>/g, '</p>\n\n<p>') // Add spacing between paragraphs
                .replace(/<\/h([1-6])><h([1-6])>/g, '</h$1>\n\n<h$2>') // Spacing between headings
                .replace(/<\/p><h([1-6])>/g, '</p>\n\n<h$1>') // Spacing before headings
                .replace(/<\/h([1-6])><p>/g, '</h$1>\n\n<p>') // Spacing after headings
                .replace(/<\/ul><p>/g, '</ul>\n\n<p>') // Spacing after lists
                .replace(/<\/ol><p>/g, '</ol>\n\n<p>') // Spacing after ordered lists
                .replace(/<\/p><ul>/g, '</p>\n\n<ul>') // Spacing before lists
                .replace(/<\/p><ol>/g, '</p>\n\n<ol>'); // Spacing before ordered lists

            onChange(html);
        },
        editorProps: {
            attributes: {
                class: "prose prose-lg max-w-none mx-auto focus:outline-none min-h-[400px] p-6 prose-p:mb-6 prose-p:leading-relaxed prose-p:text-base prose-headings:mb-4 prose-headings:mt-8 prose-h1:text-4xl prose-h1:font-serif prose-h1:font-bold prose-h2:text-3xl prose-h2:font-serif prose-h2:font-bold prose-h3:text-2xl prose-h3:font-serif prose-h3:font-bold prose-h4:text-xl prose-h4:font-serif prose-h4:font-bold prose-ul:mb-6 prose-ul:space-y-2 prose-ul:pl-6 prose-ol:mb-6 prose-ol:space-y-2 prose-ol:pl-6 prose-li:mb-2 prose-li:leading-relaxed prose-img:my-8 prose-img:w-full prose-img:h-auto prose-img:rounded-lg prose-img:shadow-md prose-hr:my-8 prose-blockquote:my-6 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80",
            },
        },
    });

    if (!editor) {
        return null;
    }

    const setLink = () => {
        if (linkUrl) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
        } else {
            editor.chain().focus().unsetLink().run();
        }
        setShowLinkInput(false);
        setLinkUrl("");
    };

    const addImage = () => {
        const url = window.prompt("Enter image URL:");
        if (url) {
            editor.chain().focus().setImage({
                src: url,
                alt: "Image"
            }).run();
        }
    };

    const addYoutube = () => {
        const url = window.prompt("Enter YouTube URL");
        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
            });
        }
    };

    return (
        <div className="border rounded-md bg-background">
            <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/30 sticky top-0 z-10">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive("bold") ? "bg-muted" : ""}
                >
                    <Bold className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive("italic") ? "bg-muted" : ""}
                >
                    <Italic className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive("underline") ? "bg-muted" : ""}
                >
                    <UnderlineIcon className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
                >
                    <Heading1 className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
                >
                    <Heading2 className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
                >
                    <Heading3 className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive("bulletList") ? "bg-muted" : ""}
                >
                    <List className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive("orderedList") ? "bg-muted" : ""}
                >
                    <ListOrdered className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive("blockquote") ? "bg-muted" : ""}
                >
                    <Quote className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                >
                    <Minus className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={editor.isActive("code") ? "bg-muted" : ""}
                >
                    <Code className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    className={editor.isActive("link") ? "bg-muted" : ""}
                >
                    <LinkIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={addImage}>
                    <ImageIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={addYoutube}>
                    <YoutubeIcon className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo className="w-4 h-4" />
                </Button>
            </div>

            {showLinkInput && (
                <div className="p-2 border-b flex gap-2 items-center bg-muted/10">
                    <Input
                        placeholder="https://example.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="h-8 text-sm"
                    />
                    <Button size="sm" onClick={setLink}>
                        Set Link
                    </Button>
                </div>
            )}

            <EditorContent editor={editor} />
        </div>
    );
}
