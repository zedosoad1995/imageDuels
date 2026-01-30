import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

const UPLOAD_FOLDER = path.join(process.cwd(), 'uploads');

function pickExisting(p: string) {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return p;
  } catch {
    return null;
  }
}

@Controller()
export class ImagesPublicController {
  @Get('/i/:id')
  get(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const accept = req.headers.accept ?? '';
    const wantsWebp = accept.includes('image/webp');

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // SVG
    if (id.endsWith('.svg')) {
      const svg = pickExisting(path.join(UPLOAD_FOLDER, id));
      if (svg) return res.sendFile(svg);
    }

    res.setHeader('Vary', 'Accept');

    const isWebP = id.endsWith('.webp');

    if (isWebP) {
      // Prefer WebP
      if (wantsWebp) {
        const webp = pickExisting(path.join(UPLOAD_FOLDER, id));
        if (webp) return res.sendFile(webp);
        throw new NotFoundException();
      }

      const { name } = path.parse(id);
      const jpgFilename = name + '.jpg';

      // Fallbacks
      const jpg = pickExisting(path.join(UPLOAD_FOLDER, jpgFilename));
      if (jpg) return res.sendFile(jpg);
    }

    throw new NotFoundException();
  }
}
