import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads/categories directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'categories');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads/categories directory');
}

// Create placeholder images for categories
const categories = [
  { name: 'dairy', emoji: '🥛' },
  { name: 'bakery', emoji: '🍞' },
  { name: 'beverages', emoji: '🥤' },
  { name: 'snacks', emoji: '🍿' },
  { name: 'fruits', emoji: '🍎' }
];

categories.forEach(category => {
  const imagePath = path.join(uploadsDir, `${category.name}.jpg`);
  
  // Create a simple SVG placeholder
  const svgContent = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#f3f4f6"/>
      <text x="50" y="50" font-size="40" text-anchor="middle" dominant-baseline="middle">${category.emoji}</text>
    </svg>
  `;
  
  // For now, just create a text file as placeholder
  const textContent = `Placeholder image for ${category.name} category`;
  fs.writeFileSync(imagePath.replace('.jpg', '.txt'), textContent);
  console.log(`Created placeholder for ${category.name}`);
});

console.log('Category image placeholders created successfully!');
