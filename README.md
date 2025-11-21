### Starlight animated steps

Turn static documentation into an interactive experience. This integration for Astro Starlight converts standard numbered lists into animated, trackable steps. It helps users follow complex tutorials by providing visual feedback as they complete each task.

### Features
- **Interactive tracking:** Select a step to mark it as complete.
- **Visual progress:** Watch the progress line light up as you move through the tutorial.
- **Simple integration:** Wraps standard Markdown lists, so you don't need to learn new syntax.

### Set up the integration
To add the animated steps to your project, follow these steps:

1. Add the 'interactive-tutorial-lists.ts' file to your src/plugins folder.
2. Add the 'next-steps.astro' component to your src/components folder.
3. Update your astro.config.mjs to include the integration.

### Use the component
You can use the component in any .mdx file in your documentation.

1. Import the NextSteps component at the top of your file.
2. Wrap your numbered list with the <NextSteps> tag.

### Example 
> "// src/content/docs/my-tutorial.mdx"

```

import NextSteps from '../../../components/next-steps.astro';

# My tutorial

<NextSteps title="Three steps to launch">
1. First step - do something important
2. Second step - do something else
3. Third step - complete the process
</NextSteps>
'''