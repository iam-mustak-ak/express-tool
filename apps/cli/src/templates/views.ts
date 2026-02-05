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
