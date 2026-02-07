# Express Tool Views Plugin

This plugin configures server-side rendering for `express-tool` applications, supporting popular template engines like EJS and Pug.

## Installation

Select a template engine during project initialization. Manual install:

```bash
npm install @express-tool/plugin-views
```

## Features

- **Template Engine Setup**: Configures EJS or Pug as the view engine.
- **Static Files**: Sets up the `public` directory for CSS, images, and JS.
- **Example Views**: Generates sample `index` and `error` views.

## Usage

Render views in your controllers:

```javascript
res.render('index', { title: 'Home' });
```

## License

MIT
