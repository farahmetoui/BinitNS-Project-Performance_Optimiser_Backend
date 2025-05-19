import { paginateArray } from '@src/services/PaginationService';
import { Request, Response } from 'express';


export const paginateTablesController= async(req: Request, res: Response)=> {
    const { data, page = 1, limit = 5 } = req.body;
  
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'Le champ "data" doit être un tableau.' });
    }
  
    const paginated = await paginateArray(data, parseInt(page), parseInt(limit));

    res.json(paginated);
  }
  