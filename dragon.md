Yes, we can absolutely add functionality for users to edit the raw HTML of any snippet or block. This is an excellent feature for power users who need granular control over the content.

Here is the complete, updated design document that incorporates this new feature.

### **Drag-and-Drop Editor Design Document**

### **1. Overview**

This document outlines the complete design and phased implementation plan for a pure JavaScript drag-and-drop HTML editor. The goal is to create a lightweight, self-contained editor that allows users to build page layouts by dragging pre-defined **Blocks** and **Snippets** onto an editable area.

This comprehensive version includes a robust set of features, such as a powerful image and video uploader, direct element resizing, and a full undo/redo history. It also features advanced capabilities like saving custom components and, critically, the ability for users to **edit the raw HTML of any Block or Snippet** for maximum control. The editor will operate in two modes: a full-featured **edit mode** and a clean **display mode**. The entire system will be delivered as two single files, `editor.js` and `editor.css`, for easy integration.

-----

### **2. Core Concepts & Terminology**

  * **Editable Area:** The main container element on the page where all editing occurs.
  * **Block:** A primary structural element that acts as a container. Blocks can hold one or more Snippets.
  * **Snippet:** A piece of pure HTML content. Snippets are dragged from a side panel into Blocks.
  * **Edit Mode:** The interactive state where the Snippet Panel, drag handles, and edit/settings icons are visible.
  * **Display Mode:** The presentation state where all editor-specific UI is hidden, showing only the final HTML.
  * **Image Snippet:** A specialized snippet for managing image uploads and display.
  * **Video Snippet:** A snippet for embedding videos via a URL.
  * **Raw HTML Editing:** The ability for a user to directly view and modify the underlying HTML code of any Block or Snippet.

-----

### **3. System Architecture**

The editor will be built using an object-oriented approach in vanilla JavaScript.

#### **3.1. File Structure**

  * `index.html`: An example host page.
  * `editor.js`: A single, self-encapsulated JavaScript file containing all logic.
  * `editor.css`: A single CSS file for all styling.
  * `snippets.html`: An HTML file containing the library of available Snippets and Blocks.

#### **3.2. Core JavaScript Components (Classes)**

  * **`Editor`:** The main controller.
  * **`SnippetPanel`:** Handles fetching and rendering available snippets.
  * **`DragDropManager`:** Manages all drag-and-drop interactions.
  * **`StyleEditorModal`:** A modal for editing general CSS properties.
  * **`ImageUploader`:** A component for handling asynchronous image uploads.
  * **`VideoSettingsModal`:** A modal for handling video snippet settings.
  * **`CodeEditorModal`:** A new modal for editing the raw HTML of any Block or Snippet.
  * **`StateHistory`:** Manages the undo/redo system.
  * **`FormattingToolbar`:** A toolbar for rich text editing.

-----

### **4. Phased Implementation Plan**

The project is broken into three distinct phases, building from a minimal viable product to a feature-rich, professional tool.

#### **4.1. Phase 1: Core Functionality (MVP)**

This phase delivers a functional editor with basic drag-and-drop and text editing.

  * **Task 4.1.1: Project Setup:**
      * Create the file structure and the main `Editor` class scaffold.
  * **Task 4.1.2: Snippet Panel & Basic D\&D:**
      * Create `snippets.html` with draggable Block and text Snippet elements.
      * Implement `SnippetPanel` to `fetch` and render snippets.
      * Develop `DragDropManager` to handle `dragstart` and `drop`.
  * **Task 4.1.3: Mode Switching & Rich Text:**
      * Implement `toggleMode()` to switch between `data-mode="edit"` and `data-mode="display"`.
      * Implement a simple `FormattingToolbar` for `contenteditable` text snippets.
  * **Task 4.1.4: Final HTML Output:**
      * Implement `getCleanHtml()` to strip all editor-specific attributes and UI elements.

#### **4.2. Phase 2: Enhanced Editing and User Experience**

This phase adds core visual editing tools and media handling.

  * **Task 4.2.1: Style Editor Modal:**
      * Create the `StyleEditorModal` for editing CSS properties like padding, margin, and borders.
      * Add a generic `.edit-icon` to all elements to trigger this modal.
  * **Task 4.2.2: Direct Resizing:**
      * Add `.resizer-handle` elements to Blocks and Snippets for direct width/height manipulation.
  * **Task 4.2.3: Image & Video Snippets:**
      * Add Image and Video Snippets to `snippets.html`.
      * Implement the `ImageUploader` component for file uploads.
      * Implement the `VideoSettingsModal` with an input for a video URL.
      * Add a `.settings-icon` to the Video Snippet to open its modal.
  * **Task 4.2.4: Undo/Redo System:**
      * Implement the `StateHistory` class and a debounced `MutationObserver` to track changes.

#### **4.3. Phase 3: Advanced Features and Content Management**

This phase adds power-user features, including the new Raw HTML Editor.

  * **Task 4.3.1: Raw HTML Editor Implementation:**
      * **Add UI Trigger:** Add a new `.code-icon` (e.g., `</>`) to the UI of every Block and Snippet, visible in Edit Mode.
      * **Implement the `CodeEditorModal`:**
          * Create the modal's HTML, including a large `<textarea>` and Save/Cancel buttons.
          * When the `.code-icon` is clicked, open the modal and pass it the target element.
          * Get the target's `innerHTML`, format it for readability (optional but recommended), and display it in the `<textarea>`.
          * On "Save," get the raw text from the `<textarea>`, sanitize it to prevent broken HTML or script injection, and then replace the target element's `innerHTML` with the sanitized content.
          * Ensure the `StateHistory` is updated by calling `saveState()` after a successful HTML edit.
  * **Task 4.3.2: Reusable Components & Context Menus:**
      * Implement `contextmenu` listeners to display a custom menu with options like "Duplicate," "Delete," and "Save as Snippet."
  * **Task 4.3.3: Advanced Design Tools:**
      * Enhance the `StyleEditorModal` with controls for CSS transitions and conditional visibility.
      * Add viewport size buttons to the main UI to toggle the editable area's `width`.

-----

### **5. JSON Payload for Saving Content**

When saving, the system serializes the page structure into a JSON object. The `content` field for snippets and the structure of blocks will reflect any changes made via the Raw HTML Editor. The schema itself does not need to change, as the raw HTML is still captured as a string.

```json
{
  "page_title": "My New Page",
  "layout": {
    "blocks": [
      {
        "block_id": "block-1",
        "styles": { "padding": "20px" },
        "snippets": [
          {
            "snippet_id": "snippet-1a",
            "type": "text",
            "styles": {},
            "content": "\n<div class=\"custom-class\"><h2>My Custom Title</h2><p>And my custom paragraph.</p></div>"
          },
          {
            "snippet_id": "snippet-1b",
            "type": "video",
            "video_data": {
              "url": "https://www.youtube.com/embed/your_video_id"
            }
          }
        ]
      }
    ]
  }
}
```