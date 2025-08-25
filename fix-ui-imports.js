const fs = require('fs');
const path = require('path');

// Define the UI directory
const uiDir = path.join(__dirname, 'ui');

// Mapping of versioned imports to clean imports
const importMappings = {
  '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
  '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
  '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
  '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
  '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
  '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
  '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
  '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
  '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
  '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
  '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
  '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
  '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
  '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
  '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
  '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
  '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
  '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
  '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
  '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
  '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
  '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
  '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
  '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
  'class-variance-authority@0.7.1': 'class-variance-authority',
  'lucide-react@0.487.0': 'lucide-react',
  'react-hook-form@7.55.0': 'react-hook-form'
};

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace versioned imports with clean imports
    for (const [versionedImport, cleanImport] of Object.entries(importMappings)) {
      const regex = new RegExp(versionedImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(versionedImport)) {
        content = content.replace(regex, cleanImport);
        modified = true;
        console.log(`Fixed ${versionedImport} -> ${cleanImport} in ${path.basename(filePath)}`);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function fixAllUIFiles() {
  try {
    const files = fs.readdirSync(uiDir);
    
    files.forEach(file => {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const filePath = path.join(uiDir, file);
        fixImportsInFile(filePath);
      }
    });
    
    console.log('\n🎉 All UI component imports have been fixed!');
  } catch (error) {
    console.error('Error reading UI directory:', error.message);
  }
}

// Run the fix
fixAllUIFiles();
