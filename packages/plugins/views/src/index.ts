import { Plugin, PluginContext } from '@express-tool/core';

export const ejsTemplates = {
  index: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= title %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <div class="container">
    <h1><%= message %></h1>
    <p>Welcome to your Express.js application!</p>
  </div>
</body>
</html>`,
  error: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Error</title>
</head>
<body>
  <h1>Error <%= status %></h1>
  <p><%= message %></p>
  <% if (error.stack) { %>
    <pre><%= error.stack %></pre>
  <% } %>
</body>
</html>`,
};

export const pugTemplates = {
  index: `doctype html
html(lang="en")
  head
    meta(charset="UTF-8")
    meta(name="viewport", content="width=device-width, initial-scale=1.0")
    title= title
    link(rel="stylesheet", href="/css/style.css")
  body
    div.container
      h1= message
      p Welcome to your Express.js application!`,
  error: `doctype html
html(lang="en")
  head
    title Error
  body
    h1 Error #{status}
    p= message
    if error.stack
      pre= error.stack`,
};

export const cssStyle = `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 2rem;
  background-color: #f4f4f4;
  color: #333;
}
.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
`;

export const viewsPlugin: Plugin = {
  name: 'views',
  apply: async (context: PluginContext, options: { templateEngine: 'ejs' | 'pug' }) => {
    const { isTs } = context;
    const { templateEngine } = options;

    if (!templateEngine || templateEngine === ('none' as any)) {
      return { files: [] } as any;
    }

    const templates = templateEngine === 'ejs' ? ejsTemplates : pugTemplates;
    const ext = templateEngine;

    return {
      dependencies: {
        [templateEngine]: templateEngine === 'ejs' ? '^3.1.10' : '^3.0.3',
      },
      devDependencies: isTs
        ? {
            [`@types/${templateEngine}`]: templateEngine === 'ejs' ? '^3.1.5' : '^2.0.10',
          }
        : {},
      files: [
        {
          path: `views/index.${ext}`,
          content: templates.index,
        },
        {
          path: `views/error.${ext}`,
          content: templates.error,
        },
        {
          path: `public/css/style.css`,
          content: cssStyle,
        },
      ],
    } as import('@express-tool/core').PluginAction;
  },
};
