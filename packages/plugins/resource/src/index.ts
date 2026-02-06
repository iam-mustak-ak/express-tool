// This plugin currently only exports utility functions for the generate command.
import { Plugin } from '@express-next/core';

export const controllerTs = (
  name: string,
) => `import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const get${name}s = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Implement logic to fetch all ${name.toLowerCase()}s
    const items = [{ id: 1, name: '${name} 1' }];
    
    res.json({
      status: 'success',
      data: items
    });
  } catch (error) {
    next(error);
  }
};

export const get${name} = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // TODO: Implement logic to fetch ${name.toLowerCase()} by ID
    
    res.json({
      status: 'success',
      data: { id, name: '${name} ' + id }
    });
  } catch (error) {
    next(error);
  }
};

export const create${name} = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    // TODO: Implement logic to create ${name.toLowerCase()}
    
    logger.info(\`Created ${name.toLowerCase()}: \${JSON.stringify(data)}\`);
    
    res.status(201).json({
      status: 'success',
      data: { id: Date.now(), ...data }
    });
  } catch (error) {
    next(error);
  }
};

export const update${name} = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;
    // TODO: Implement logic to update ${name.toLowerCase()}
    
    res.json({
      status: 'success',
      data: { id, ...data }
    });
  } catch (error) {
    next(error);
  }
};

export const delete${name} = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // TODO: Implement logic to delete ${name.toLowerCase()}
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
`;

export const controllerJs = (name: string) => `import { logger } from '../utils/logger';

export const get${name}s = async (req, res, next) => {
  try {
    // TODO: Implement logic to fetch all ${name.toLowerCase()}s
    const items = [{ id: 1, name: '${name} 1' }];
    
    res.json({
      status: 'success',
      data: items
    });
  } catch (error) {
    next(error);
  }
};

export const get${name} = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: Implement logic to fetch ${name.toLowerCase()} by ID
    
    res.json({
      status: 'success',
      data: { id, name: '${name} ' + id }
    });
  } catch (error) {
    next(error);
  }
};

export const create${name} = async (req, res, next) => {
  try {
    const data = req.body;
    // TODO: Implement logic to create ${name.toLowerCase()}
    
    logger.info(\`Created ${name.toLowerCase()}: \${JSON.stringify(data)}\`);
    
    res.status(201).json({
      status: 'success',
      data: { id: Date.now(), ...data }
    });
  } catch (error) {
    next(error);
  }
};

export const update${name} = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    // TODO: Implement logic to update ${name.toLowerCase()}
    
    res.json({
      status: 'success',
      data: { id, ...data }
    });
  } catch (error) {
    next(error);
  }
};

export const delete${name} = async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: Implement logic to delete ${name.toLowerCase()}
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
`;

export const routesTs = (name: string) => `import { Router } from 'express';
import * as ${name.toLowerCase()}Controller from '../controllers/${name.toLowerCase()}.controller';

const router = Router();

router.get('/', ${name.toLowerCase()}Controller.get${name}s);
router.get('/:id', ${name.toLowerCase()}Controller.get${name});
router.post('/', ${name.toLowerCase()}Controller.create${name});
router.put('/:id', ${name.toLowerCase()}Controller.update${name});
router.delete('/:id', ${name.toLowerCase()}Controller.delete${name});

export const ${name.toLowerCase()}Router = router;
`;

export const routesJs = (name: string) => `import { Router } from 'express';
import * as ${name.toLowerCase()}Controller from '../controllers/${name.toLowerCase()}.controller';

const router = Router();

router.get('/', ${name.toLowerCase()}Controller.get${name}s);
router.get('/:id', ${name.toLowerCase()}Controller.get${name});
router.post('/', ${name.toLowerCase()}Controller.create${name});
router.put('/:id', ${name.toLowerCase()}Controller.update${name});
router.delete('/:id', ${name.toLowerCase()}Controller.delete${name});

export const ${name.toLowerCase()}Router = router;
`;

export const testTs = (name: string) => `import request from 'supertest';
import { app } from '../src/index';
import { describe, it, expect } from 'vitest';

describe('${name} API', () => {
  it('GET /${name.toLowerCase()}s should return all ${name.toLowerCase()}s', async () => {
    const res = await request(app).get('/${name.toLowerCase()}s');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /${name.toLowerCase()}s should create a new ${name.toLowerCase()}', async () => {
    const res = await request(app)
      .post('/${name.toLowerCase()}s')
      .send({
        name: 'Test ${name}'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.name).toBe('Test ${name}');
  });
});
`;

export const testJs = (name: string) => `import request from 'supertest';
import { app } from '../src/index';
import { describe, it, expect } from 'vitest';

describe('${name} API', () => {
  it('GET /${name.toLowerCase()}s should return all ${name.toLowerCase()}s', async () => {
    const res = await request(app).get('/${name.toLowerCase()}s');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /${name.toLowerCase()}s should create a new ${name.toLowerCase()}', async () => {
    const res = await request(app)
      .post('/${name.toLowerCase()}s')
      .send({
        name: 'Test ${name}'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.name).toBe('Test ${name}');
  });
});
`;

export const resourcePlugin: Plugin = {
  name: 'resource',
  apply: async () => {
    return {
      files: [],
    } as import('@express-next/core').PluginAction;
  },
};
