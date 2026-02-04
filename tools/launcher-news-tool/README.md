# Launcher News Tool

A simple CLI tool to manage and publish news updates for the Communokot Launcher.

## Purpose

This tool generates the `updates.json` file consumed by the launcher's "Mises à jour" tab. It handles image management and ID generation automatically.

## Usage

Run the tool from this directory:

```bash
node index.js [command]
```

### Commands

- **`create` / `new`** (default): internal interactive wizard to create a new news item.
  - Prompts for Title, Subtitle, Content, and Image Path.
  - Copies images to `launcher-news/main/images/`.
  - Generates a unique ID based on the title.
  - Prepend the new item to `updates.json`.

- **`list` / `ls`**: Lists all currently saved news items.

- **`push` / `publish`**: Commits and pushes the `launcher-news` directory to GitHub.
  - **Note**: Requires git to be configured in the project root.

## Data Structure

The tool modifies `launcher-news/main/updates.json` with the following format:

```json
[
  {
    "id": "example-news-id",
    "title": "Example News",
    "subtitle": "Short description",
    "content": "Full content...",
    "image": "https://raw.githubusercontent.com/theocode29/Communokot-Launcher/main/launcher-news/main/images/example-news-id.jpg",
    "date": "04/02/2026"
  }
]
```

## Setup

No installation required beyond the project's root `npm install`. The script runs with standard Node.js libraries.
