# Discord Embed Builder

Advanced Discord embed builder with drag-and-drop functionality, snap-to-grid, and live JSON export.

## Features

### 🎨 Visual Builder
- **Drag & Drop Interface**: Intuitive block-based editing
- **Snap-to-Grid**: 8px grid system with edge snapping
- **Live Preview**: Real-time Discord-like preview
- **Zone-based Layout**: Header, Body, Side, and Footer zones

### 📦 Block Types
- **Title**: Embed title with optional URL
- **Description**: Rich text with markdown support
- **Author**: Name, URL, and icon
- **Footer**: Text and icon
- **Thumbnail**: Small image thumbnail
- **Image**: Large embed image
- **URL**: Clickable URL for title
- **Timestamp**: Embed timestamp toggle
- **Field**: Name-value pairs with inline option

### 🔧 Advanced Features
- **Undo/Redo**: History stack with up to 50 steps
- **Auto-save**: Automatic draft saving to localStorage
- **Zoom Control**: 75% to 150% zoom levels
- **Theme Support**: Light, dark, and system themes
- **Grid Toggle**: Show/hide grid overlay
- **Snap Toggle**: Enable/disable snap-to-grid

### 📤 Export Options
- **Discord Embed JSON**: Direct embed format
- **Webhook Payload**: Complete webhook format
- **Markdown Summary**: Documentation format
- **Validation**: Real-time Discord API validation
- **Copy & Download**: One-click export

### 🎯 Preset Templates
- **Announcement**: General server announcements
- **Patch Notes**: Update and change logs
- **Giveaway**: Contest and giveaway posts
- **Alert**: Important warning messages

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **dnd-kit** for drag & drop
- **Framer Motion** for animations
- **Zod** for schema validation
- **Lucide React** for icons

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd discord-embed-builder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Usage

### Adding Blocks
1. Click "Add Block" in the toolbar
2. Select a block type from the dropdown
3. Blocks are automatically positioned in their appropriate zones

### Editing Blocks
1. Click on any block to select it
2. Use the Properties panel on the left to edit content
3. Character limits are enforced and displayed

### Moving Blocks
1. Drag blocks by their grip handle
2. Blocks snap to grid and other blocks
3. Use arrow keys for precise positioning (1px increments)
4. Hold Shift + arrow keys for 4px increments

### Exporting
1. Choose export format (Embed, Webhook, or Markdown)
2. Validation errors are shown in real-time
3. Click "Copy" to copy to clipboard
4. Click "Download" to save as file

### Templates
1. Browse preset templates in the right sidebar
2. Click any template to load it
3. Customize the template as needed

## Discord API Limits

The builder enforces Discord's embed limits:

- **Title**: 256 characters
- **Description**: 4,096 characters
- **Fields**: Maximum 25 fields
- **Field Name**: 256 characters
- **Field Value**: 1,024 characters
- **Footer Text**: 2,048 characters
- **Author Name**: 256 characters
- **Total Embed**: 6,000 characters

## File Structure

```
src/
├── components/
│   ├── Canvas/           # Canvas and drag-drop components
│   ├── Controls/         # Toolbar, properties, export panels
│   └── ui/              # Reusable UI components
├── lib/                 # Utility functions and schemas
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the Discord API documentation
- Review the validation errors in the export panel

## Roadmap

- [ ] Multiple embed support
- [ ] Custom color picker
- [ ] Image upload integration
- [ ] Template sharing
- [ ] Keyboard shortcuts
- [ ] Mobile responsiveness
- [ ] PWA support 