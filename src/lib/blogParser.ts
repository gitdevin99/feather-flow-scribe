
// Types for our blog structure
export interface BlogStructure {
  title: string;
  sections: BlogSection[];
}

export interface BlogSection {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bulletList' | 'numberedList' | 'image';
  content: string;
  children?: BlogSection[];
}

/**
 * Detects the structure of a blog from markdown text
 */
export function detectStructure(markdownContent: string): BlogStructure {
  const lines = markdownContent.split('\n');
  let structure: BlogStructure = {
    title: '',
    sections: []
  };

  let currentSection: BlogSection | null = null;
  let listItems: string[] = [];
  let isNumberedList = false;

  // Extract title from the first heading if available
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('# ')) {
      structure.title = lines[i].substring(2).trim();
      break;
    }
  }

  // Process the rest of the content
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Process headings
    if (line.startsWith('# ')) {
      if (currentSection) {
        structure.sections.push(currentSection);
      }
      currentSection = { type: 'heading1', content: line.substring(2).trim() };
    } 
    else if (line.startsWith('## ')) {
      if (currentSection) {
        structure.sections.push(currentSection);
      }
      currentSection = { type: 'heading2', content: line.substring(3).trim() };
    } 
    else if (line.startsWith('### ')) {
      if (currentSection) {
        structure.sections.push(currentSection);
      }
      currentSection = { type: 'heading3', content: line.substring(4).trim() };
    }
    // Process lists
    else if (line.startsWith('* ') || line.startsWith('- ')) {
      // If we were collecting numbered list items, add the numbered list and reset
      if (isNumberedList && listItems.length > 0) {
        if (currentSection) {
          structure.sections.push(currentSection);
        }
        currentSection = { type: 'numberedList', content: listItems.join('\n') };
        listItems = [];
      }
      
      // Start or continue a bullet list
      isNumberedList = false;
      listItems.push(line.substring(2).trim());
      
      // If this is the last line or the next line is not a list item, add the list
      if (i === lines.length - 1 || 
          !(lines[i+1].trim().startsWith('* ') || lines[i+1].trim().startsWith('- '))) {
        if (currentSection) {
          structure.sections.push(currentSection);
        }
        currentSection = { type: 'bulletList', content: listItems.join('\n') };
        listItems = [];
      }
    }
    // Process numbered lists
    else if (/^\d+\.\s/.test(line)) {
      // If we were collecting bullet list items, add the bullet list and reset
      if (!isNumberedList && listItems.length > 0) {
        if (currentSection) {
          structure.sections.push(currentSection);
        }
        currentSection = { type: 'bulletList', content: listItems.join('\n') };
        listItems = [];
      }
      
      // Start or continue a numbered list
      isNumberedList = true;
      // Extract just the content after the number and period
      const listContent = line.replace(/^\d+\.\s/, '').trim();
      listItems.push(listContent);
      
      // If this is the last line or the next line is not a numbered list item, add the list
      if (i === lines.length - 1 || !/^\d+\.\s/.test(lines[i+1]?.trim() || '')) {
        if (currentSection) {
          structure.sections.push(currentSection);
        }
        currentSection = { type: 'numberedList', content: listItems.join('\n') };
        listItems = [];
      }
    }
    // Process paragraphs
    else {
      if (currentSection) {
        structure.sections.push(currentSection);
      }
      currentSection = { type: 'paragraph', content: line };
    }
  }

  // Add the last section if there is one
  if (currentSection) {
    structure.sections.push(currentSection);
  }

  return structure;
}

/**
 * Converts detected blog structure to Notion format
 */
export function convertToNotionFormat(structure: BlogStructure): string {
  let notionContent = '';
  
  // Add the title
  if (structure.title) {
    notionContent += `# ${structure.title}\n\n`;
  }
  
  // Process each section
  for (const section of structure.sections) {
    switch (section.type) {
      case 'heading1':
        notionContent += `# ${section.content}\n\n`;
        break;
      case 'heading2':
        notionContent += `## ${section.content}\n\n`;
        break;
      case 'heading3':
        notionContent += `### ${section.content}\n\n`;
        break;
      case 'paragraph':
        notionContent += `${section.content}\n\n`;
        break;
      case 'bulletList':
        const bulletItems = section.content.split('\n');
        for (const item of bulletItems) {
          notionContent += `- ${item}\n`;
        }
        notionContent += '\n';
        break;
      case 'numberedList':
        const numberedItems = section.content.split('\n');
        for (let i = 0; i < numberedItems.length; i++) {
          notionContent += `${i+1}. ${numberedItems[i]}\n`;
        }
        notionContent += '\n';
        break;
      case 'image':
        notionContent += `![Image](${section.content})\n\n`;
        break;
    }
  }
  
  return notionContent;
}

// Helper function to enhance Notion formatting with Feather blog template specifics
export function enhanceWithFeatherTemplate(notionContent: string): string {
  // This would implement specific formatting for the Feather blog template
  // For now, just return the content as is
  return notionContent;
}
