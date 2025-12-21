import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { PreviewPanel } from '../PreviewPanel';

describe('PreviewPanel', () => {
  // Simple unit test to verify basic rendering
  it('should render basic markdown with images', () => {
    const markdown = `# Hello

![alt text](http://example.com/image.png)

[link text](http://example.com)`;
    
    const { container } = render(<PreviewPanel content={markdown} />);
    
    // Check that content is rendered
    expect(container.textContent).toContain('Hello');
    
    // Check for images
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThan(0);
    
    // Check for links
    const links = container.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
  });

  // Test with the exact counterexample from property test
  it('should render counterexample markdown', () => {
    const markdown = `
# a

\`\`\`javascript
0
\`\`\`

a | 0
--- | ---
A | A

![0](http://a.aa)

[a](http://a.aa)
`;
    
    const { container } = render(<PreviewPanel content={markdown} />);
    
    // Check for images
    const imgs = container.querySelectorAll('img');
    console.log('Images found:', imgs.length);
    console.log('HTML:', container.innerHTML);
    expect(imgs.length).toBeGreaterThan(0);
  });

  /**
   * Feature: md-review-app, Property 4: Markdown rendering completeness
   * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
   * 
   * For any valid Markdown content containing code blocks, tables, images, or links,
   * the rendered preview should contain corresponding HTML elements
   * (pre/code tags, table tags, img tags, anchor tags).
   */
  it('should render all Markdown elements correctly', () => {
    // Generator for non-empty, non-whitespace alphanumeric strings
    const nonEmptyString = (minLength: number, maxLength: number) =>
      fc.stringMatching(/^[a-zA-Z0-9 ]+$/)
        .filter(s => s.trim().length >= minLength && s.trim().length <= maxLength);

    fc.assert(
      fc.property(
        fc.record({
          // Generate random Markdown content with various elements
          heading: nonEmptyString(1, 50),
          codeBlock: fc.record({
            language: fc.constantFrom('javascript', 'python', 'typescript', 'bash', 'json'),
            code: nonEmptyString(1, 100),
          }),
          image: fc.record({
            alt: nonEmptyString(1, 50),
            // Filter out URLs with parentheses as they break Markdown syntax
            url: fc.webUrl().filter(url => !url.includes('(') && !url.includes(')')),
          }),
          link: fc.record({
            text: nonEmptyString(1, 50),
            // Filter out URLs with parentheses as they break Markdown syntax
            url: fc.webUrl().filter(url => !url.includes('(') && !url.includes(')')),
          }),
        }),
        ({ heading, codeBlock, image, link }) => {
          // Build Markdown content with proper spacing
          const markdown = `# ${heading}

\`\`\`${codeBlock.language}
${codeBlock.code}
\`\`\`

![${image.alt}](${image.url})

[${link.text}](${link.url})
`;

          // Render the component
          const { container } = render(<PreviewPanel content={markdown} />);

          // Verify code blocks are rendered (pre/code tags)
          const codeElements = container.querySelectorAll('pre, code');
          expect(codeElements.length).toBeGreaterThan(0);

          // Verify images are rendered (img tags)
          const imgElements = container.querySelectorAll('img');
          expect(imgElements.length).toBeGreaterThan(0);
          expect(imgElements[0].getAttribute('alt')).toBe(image.alt);
          expect(imgElements[0].getAttribute('src')).toBe(image.url);

          // Verify links are rendered (anchor tags)
          const linkElements = container.querySelectorAll('a');
          expect(linkElements.length).toBeGreaterThan(0);
          const ourLink = Array.from(linkElements).find(
            a => a.textContent === link.text
          );
          expect(ourLink).toBeDefined();
          expect(ourLink?.getAttribute('href')).toBe(link.url);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Separate test for table rendering
  it('should render tables correctly', () => {
    const markdown = `
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;
    
    const { container } = render(<PreviewPanel content={markdown} />);
    
    const tables = container.querySelectorAll('table');
    expect(tables.length).toBeGreaterThan(0);
  });
});
