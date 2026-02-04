#!/usr/bin/env node

/**
 * Launcher News Tool
 * CLI tool to create and publish news for the Communokot Launcher
 * 
 * Usage:
 *   node index.js create    - Interactive news creation
 *   node index.js list      - List existing news
 *   node index.js push      - Push to GitHub
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const NEWS_DIR = path.join(__dirname, '../../launcher-news/main');
const UPDATES_FILE = path.join(NEWS_DIR, 'updates.json');
const IMAGES_DIR = path.join(NEWS_DIR, 'images');

// Ensure directories exist
function ensureDirs() {
    if (!fs.existsSync(NEWS_DIR)) {
        fs.mkdirSync(NEWS_DIR, { recursive: true });
    }
    if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
}

// Load existing news
function loadNews() {
    try {
        if (fs.existsSync(UPDATES_FILE)) {
            return JSON.parse(fs.readFileSync(UPDATES_FILE, 'utf-8'));
        }
    } catch (e) {
        console.error('Error loading news:', e.message);
    }
    return [];
}

// Save news
function saveNews(news) {
    fs.writeFileSync(UPDATES_FILE, JSON.stringify(news, null, 2), 'utf-8');
    console.log(`✅ News saved to ${UPDATES_FILE}`);
}

// Create readline interface
function createReadline() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
}

// Ask question helper
function ask(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

// Format date as DD/MM/YYYY
function formatDate(date = new Date()) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Generate ID from title
function generateId(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
        '-' + Date.now().toString(36);
}

// Create a new news item interactively
async function createNews() {
    ensureDirs();
    const rl = createReadline();

    console.log('\n📰 Création d\'une nouvelle actualité\n');

    const title = await ask(rl, 'Titre: ');
    const subtitle = await ask(rl, 'Sous-titre (optionnel): ');
    const content = await ask(rl, 'Contenu: ');
    const imagePath = await ask(rl, 'Chemin vers l\'image (optionnel): ');

    rl.close();

    // Process image if provided
    let imageUrl = '';
    if (imagePath && fs.existsSync(imagePath)) {
        const ext = path.extname(imagePath);
        const imageName = generateId(title) + ext;
        const destPath = path.join(IMAGES_DIR, imageName);

        fs.copyFileSync(imagePath, destPath);
        imageUrl = `https://raw.githubusercontent.com/theocode29/Communokot-Launcher/main/launcher-news/main/images/${imageName}`;
        console.log(`📷 Image copied to ${destPath}`);
    }

    // Create news item
    const newsItem = {
        id: generateId(title),
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        content: content.trim(),
        image: imageUrl || undefined,
        date: formatDate(),
    };

    // Load existing and prepend new
    const news = loadNews();
    news.unshift(newsItem);
    saveNews(news);

    console.log('\n✨ Actualité créée avec succès!\n');
    console.log(JSON.stringify(newsItem, null, 2));
}

// List existing news
function listNews() {
    const news = loadNews();

    if (news.length === 0) {
        console.log('\n📭 Aucune actualité.\n');
        return;
    }

    console.log(`\n📋 ${news.length} actualité(s):\n`);

    news.forEach((item, index) => {
        console.log(`${index + 1}. [${item.date}] ${item.title}`);
        if (item.subtitle) console.log(`   ${item.subtitle}`);
    });

    console.log('');
}

// Push to GitHub
function pushToGitHub() {
    try {
        const rootDir = path.join(__dirname, '../..');

        console.log('\n🚀 Pushing to GitHub...\n');

        execSync('git add launcher-news/', { cwd: rootDir, stdio: 'inherit' });
        execSync('git commit -m "Update launcher news"', { cwd: rootDir, stdio: 'inherit' });
        execSync('git push', { cwd: rootDir, stdio: 'inherit' });

        console.log('\n✅ Successfully pushed to GitHub!\n');
    } catch (e) {
        console.error('\n❌ Failed to push:', e.message);
    }
}

// Main
const command = process.argv[2] || 'create';

switch (command) {
    case 'create':
    case 'new':
    case 'add':
        createNews();
        break;
    case 'list':
    case 'ls':
        listNews();
        break;
    case 'push':
    case 'publish':
        pushToGitHub();
        break;
    default:
        console.log(`
Launcher News Tool

Usage:
  node index.js create    Create a new news item
  node index.js list      List existing news
  node index.js push      Push to GitHub
    `);
}
